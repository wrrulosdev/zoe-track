/**
 * Returns a Promise that resolves after a specified number of milliseconds.
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>} A Promise that resolves after the delay.
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Returns a Promise that resolves after a random delay between min and max milliseconds.
 * @param {number} min - The minimum delay duration in milliseconds.
 * @param {number} max - The maximum delay duration in milliseconds.
 * @returns {Promise<void>} A Promise that resolves after the random delay.
 */
export function randomDelay(min: number, max: number): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return delay(ms);
}
