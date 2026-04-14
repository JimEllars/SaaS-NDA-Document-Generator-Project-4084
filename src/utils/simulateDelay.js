/**
 * Helper to simulate a network delay.
 * @param {number} ms The delay in milliseconds.
 * @returns {Promise<void>}
 */
export const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
