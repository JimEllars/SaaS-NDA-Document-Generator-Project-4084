import { fetchWithTimeout } from "./fetchWithTimeout.js";

const getEnvContext = () => {
    if (typeof window === 'undefined') return 'unknown';
    const hostname = window.location.hostname;
    if (hostname === 'quickndacontract.com' || hostname === 'www.quickndacontract.com') {
        return 'production';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'local';
    }
    return 'staging';
};


// Queue to hold offline diagnostics
let diagnosticQueue = [];
let isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;

// Listen for network changes in browser environment
if (typeof window !== 'undefined') {
    window.addEventListener('offline', () => {
        isOffline = true;
        const fault = {
            type: 'network_dropout',
            network_degraded: true,
            timestamp: new Date().toISOString(),
        };
        diagnosticQueue.push(fault);
        console.log("Network disconnected. Buffered dropout event.");
    });

    window.addEventListener('online', () => {
        isOffline = false;
        console.log("Network restored. Flushing diagnostic queue.");
        if (diagnosticQueue.length > 0) {
            flushDiagnosticQueue();
        }
    });
}

const flushDiagnosticQueue = async () => {
    if (diagnosticQueue.length === 0) return;

    const payload = {
        app_id: "nda-generator",
        env: getEnvContext(),
        events: [...diagnosticQueue],
        flushed_at: new Date().toISOString(),
    };

    diagnosticQueue = []; // Clear queue

    try {
        const url = import.meta.env.VITE_TELEMETRY_DIAGNOSTICS_URL || '/api/v1/telemetry/diagnostics';
        await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Telemetry failed to flush diagnostics", e);
        // Re-queue on failure
        diagnosticQueue.push(...payload.events);
    }
};

export const flushTelemetry = async (payload) => {
    payload.project_id = "AXIM_NDA_GENERATOR";
    payload.environment = "production";
    try {
        const url = import.meta.env.VITE_TELEMETRY_URL || '/api/v1/telemetry/errors';
        await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Telemetry failed to flush", e);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = window.localStorage.getItem('axim_telemetry_buffer') || '[]';
                const buffer = JSON.parse(stored);
                buffer.push(payload);
                window.localStorage.setItem('axim_telemetry_buffer', JSON.stringify(buffer));
            } else {
                diagnosticQueue.push(payload);
            }
        } catch (storageError) {
            console.error("Failed to buffer telemetry locally", storageError);
        }
    }
};

export const logException = (error, context = {}) => {
    const payload = {
        app_id: "nda-generator",
        env: getEnvContext(),
        error_message: error?.message || "Unknown error",
        error_stack: error?.stack || null,
        context,
        timestamp: new Date().toISOString()
    };
    flushTelemetry(payload);
};
