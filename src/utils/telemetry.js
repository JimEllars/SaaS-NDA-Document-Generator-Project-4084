import { fetchWithTimeout } from "./fetchWithTimeout.js";

export const flushTelemetry = async (payload) => {
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
    }
};

export const logException = (error, context = {}) => {
    const payload = {
        app_id: "nda-generator",
        error_message: error?.message || "Unknown error",
        error_stack: error?.stack || null,
        context,
        timestamp: new Date().toISOString()
    };
    flushTelemetry(payload);
};
