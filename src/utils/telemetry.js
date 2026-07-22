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

let eventQueue = [];
let flushTimeout = null;

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
        flushTelemetry(); // Flush standard event queue on restore
    });

    window.addEventListener('focus', () => {
        if (!isOffline) {
            flushLocalStorageQueue();
        }
    });

    window.addEventListener('beforeunload', () => {
        flushTelemetry(true);
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
        telemetry_envelope: {
            project_id: "AXIM_NDA_GENERATOR",
            environment: getEnvContext(),
            orchestration_engine: window.location.search.includes('source=onyx') ? "Onyx" : "None",
            timestamp: new Date().toISOString()
        },
        event_payload: {
            events: [...diagnosticQueue],
            flushed_at: new Date().toISOString()
        }
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

export const logTelemetryEvent = (payload) => {
    let finalPayload;

    if (payload.telemetry_envelope) {
        finalPayload = payload;
    } else {
        finalPayload = {
            telemetry_envelope: {
                project_id: "AXIM_NDA_GENERATOR",
                environment: "production",
                timestamp: new Date().toISOString(),
                ecosystem_link: {
                    source: "web_client"
                }
            },
            event_payload: {
                ...payload,
                event_type: payload.event_type || "general_telemetry",
                severity: payload.severity || "INFO"
            }
        };

        if (payload.context && payload.context.source === "onyx") {
            finalPayload.telemetry_envelope.orchestration_engine = "Onyx";
        }
    }

    eventQueue.push(finalPayload);

    if (eventQueue.length >= 10) {
        flushTelemetry();
    } else {
        if (flushTimeout) clearTimeout(flushTimeout);
        flushTimeout = setTimeout(() => flushTelemetry(), 3000);
    }
};

export const flushTelemetry = async (isUnloading = false) => {
    if (eventQueue.length === 0) return;
    if (flushTimeout) clearTimeout(flushTimeout);

    const payloadToFlush = [...eventQueue];
    eventQueue = [];

    const url = import.meta.env.VITE_TELEMETRY_URL || '/api/v1/telemetry/events';

    // Batch payload wrapper
    const bulkPayload = {
        telemetry_envelope: {
            project_id: "AXIM_NDA_GENERATOR",
            environment: getEnvContext(),
            orchestration_engine: typeof window !== 'undefined' && window.location.search.includes('source=onyx') ? "Onyx" : "None",
            timestamp: new Date().toISOString()
        },
        event_payload: {
            batch: payloadToFlush,
            flushed_at: new Date().toISOString()
        }
    };

    if (isUnloading && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(bulkPayload)], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
        return;
    }

    try {
        await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bulkPayload)
        });
    } catch (e) {
        console.error("Telemetry failed to flush", e);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = window.localStorage.getItem('axim_telemetry_buffer') || '[]';
                const buffer = JSON.parse(stored);
                buffer.push(...payloadToFlush);
                window.localStorage.setItem('axim_telemetry_buffer', JSON.stringify(buffer));
            } else {
                diagnosticQueue.push(...payloadToFlush);
            }
        } catch (storageError) {
            console.error("Failed to buffer telemetry locally", storageError);
        }
    }
};

export const logException = (error, context = {}) => {
    const payload = {
        telemetry_envelope: {
            project_id: "AXIM_NDA_GENERATOR",
            environment: getEnvContext(),
            orchestration_engine: typeof window !== 'undefined' && window.location.search.includes('source=onyx') ? "Onyx" : "None",
            timestamp: new Date().toISOString()
        },
        event_payload: {
            error_message: error?.message || "Unknown error",
            error_stack: error?.stack || null,
            context
        }
    };
    logTelemetryEvent(payload);
};
