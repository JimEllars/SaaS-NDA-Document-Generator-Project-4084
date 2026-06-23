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

const flushLocalStorageQueue = async () => {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
        const stored = window.localStorage.getItem('axim_telemetry_buffer');
        if (!stored) return;

        const buffer = JSON.parse(stored);
        if (!Array.isArray(buffer) || buffer.length === 0) return;

        const url = import.meta.env.VITE_TELEMETRY_URL || '/api/v1/telemetry/errors';

        const successfulIndices = [];

        for (let i = 0; i < buffer.length; i++) {
            try {
                const response = await fetchWithTimeout(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(buffer[i])
                });

                if (response && (response.status === 200 || response.status === 202)) {
                    successfulIndices.push(i);
                }
            } catch (err) {
                console.error("Failed to sync queued telemetry packet", err);
            }
        }

        if (successfulIndices.length > 0) {
            const remaining = buffer.filter((_, index) => !successfulIndices.includes(index));
            if (remaining.length === 0) {
                window.localStorage.removeItem('axim_telemetry_buffer');
            } else {
                window.localStorage.setItem('axim_telemetry_buffer', JSON.stringify(remaining));
            }
        }
    } catch (e) {
        console.error("Error processing local storage telemetry queue", e);
    }
};

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
        flushLocalStorageQueue();
    });

    window.addEventListener('focus', () => {
        if (!isOffline) {
            flushLocalStorageQueue();
        }
    });

    // Initial flush
    setTimeout(() => {
        if (!isOffline) {
            flushLocalStorageQueue();
        }
    }, 1000);
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
    // Determine if this is a standard payload or if it needs to be wrapped
    let finalPayload;

    // Check if it's already wrapped in the new telemetry_envelope schema
    if (payload.telemetry_envelope) {
        finalPayload = payload;
    } else {
        // Legacy or general error payload wrapping
        finalPayload = {
            telemetry_envelope: {
                project_id: "AXIM_NDA_GENERATOR",
                environment: "production",
                timestamp: new Date().toISOString()
            },
            event_payload: {
                ...payload,
                event_type: payload.event_type || "general_telemetry",
                severity: payload.severity || "INFO"
            }
        };
    }

    try {
        const url = import.meta.env.VITE_TELEMETRY_URL || '/api/v1/telemetry/errors';
        await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalPayload)
        });
    } catch (e) {
        console.error("Telemetry failed to flush", e);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = window.localStorage.getItem('axim_telemetry_buffer') || '[]';
                const buffer = JSON.parse(stored);
                buffer.push(finalPayload);
                window.localStorage.setItem('axim_telemetry_buffer', JSON.stringify(buffer));
            } else {
                diagnosticQueue.push(finalPayload);
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
