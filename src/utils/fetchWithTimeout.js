export const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = 15000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    clearTimeout(id);
    if (!response.ok && (response.status === 502 || response.status === 503)) {
      throw new Error("Our servers are experiencing high traffic. Your document draft is saved locally. Please try generating again in a moment.");
    }
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error("Our servers are experiencing high traffic. Your document draft is saved locally. Please try generating again in a moment.");
    }
    throw error;
  }
};
