const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false
});

const generateRecentEventsOriginal = (status, latency) => {
  const now = Date.now();
  if (status === 'operational') {
    return [
      `[${TIME_FORMATTER.format(now - 10000)}] Health check passed (${latency}ms)`,
      `[${TIME_FORMATTER.format(now - 60000)}] Traffic steady at 45 req/s`,
      `[${TIME_FORMATTER.format(now - 120000)}] Edge cache hit ratio: 94%`
    ];
  } else if (status === 'degraded') {
    return [
      `[${TIME_FORMATTER.format(now - 5000)}] Warning: Elevated latency (${latency}ms)`,
      `[${TIME_FORMATTER.format(now - 15000)}] Connection pool utilization > 80%`,
      `[${TIME_FORMATTER.format(now - 45000)}] Health check marginal`
    ];
  } else {
    return [
      `[${TIME_FORMATTER.format(now - 2000)}] CRITICAL: Endpoint returning 500 Error`,
      `[${TIME_FORMATTER.format(now - 8000)}] Connection timeout after 5000ms`,
      `[${TIME_FORMATTER.format(now - 15000)}] Health check failed`
    ];
  }
};

const generateRecentEventsOptimized = (() => {
  let lastTick = 0;
  let cachedTimes = {};

  return (status, latency) => {
    const now = Date.now();
    // Only update cache if more than 1 second has passed
    if (now - lastTick > 1000) {
      lastTick = now;
      cachedTimes = {
        10000: TIME_FORMATTER.format(now - 10000),
        60000: TIME_FORMATTER.format(now - 60000),
        120000: TIME_FORMATTER.format(now - 120000),
        5000: TIME_FORMATTER.format(now - 5000),
        15000: TIME_FORMATTER.format(now - 15000),
        45000: TIME_FORMATTER.format(now - 45000),
        2000: TIME_FORMATTER.format(now - 2000),
        8000: TIME_FORMATTER.format(now - 8000),
      };
    }

    if (status === 'operational') {
      return [
        `[${cachedTimes[10000]}] Health check passed (${latency}ms)`,
        `[${cachedTimes[60000]}] Traffic steady at 45 req/s`,
        `[${cachedTimes[120000]}] Edge cache hit ratio: 94%`
      ];
    } else if (status === 'degraded') {
      return [
        `[${cachedTimes[5000]}] Warning: Elevated latency (${latency}ms)`,
        `[${cachedTimes[15000]}] Connection pool utilization > 80%`,
        `[${cachedTimes[45000]}] Health check marginal`
      ];
    } else {
      return [
        `[${cachedTimes[2000]}] CRITICAL: Endpoint returning 500 Error`,
        `[${cachedTimes[8000]}] Connection timeout after 5000ms`,
        `[${cachedTimes[15000]}] Health check failed`
      ];
    }
  };
})();

const ITERATIONS = 10000;

function runBench() {
  console.log("Warming up...");
  for (let i = 0; i < 1000; i++) {
    generateRecentEventsOriginal('operational', 45);
    generateRecentEventsOptimized('operational', 45);
  }

  console.log(`Running ${ITERATIONS} iterations per function...`);

  const startOriginal = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    // Simulate updating 10 apps exactly at the same tick
    for (let j = 0; j < 10; j++) {
      generateRecentEventsOriginal('operational', 45);
    }
  }
  const endOriginal = performance.now();

  const startOptimized = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    for (let j = 0; j < 10; j++) {
      generateRecentEventsOptimized('operational', 45);
    }
  }
  const endOptimized = performance.now();

  console.log(`Original: ${endOriginal - startOriginal}ms`);
  console.log(`Optimized: ${endOptimized - startOptimized}ms`);
  console.log(`Speedup: ${((endOriginal - startOriginal) / (endOptimized - startOptimized)).toFixed(2)}x`);
}

runBench();
