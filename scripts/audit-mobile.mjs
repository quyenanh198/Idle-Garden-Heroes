import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--no-sandbox'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const cdp = await page.createCDPSession();
  await cdp.send('Performance.enable');
  const cpuThrottle = Math.max(1, Number(process.env.CPU_THROTTLE) || 1);
  if (cpuThrottle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.AUDIT_URL || 'http://127.0.0.1:4173/', { waitUntil: 'networkidle2' });
  const report = {};
  for (const screen of ['garden', 'combat']) {
    await page.click(`.mobile-dock [data-screen="${screen}"]`);
    await new Promise(resolve => setTimeout(resolve, 900));
    const frame = await page.evaluate(async () => {
      const intervals = [];
      let previous = 0;
      const start = performance.now();
      await new Promise(resolve => {
        const sample = time => {
          if (previous) intervals.push(time - previous);
          previous = time;
          if (time - start < 5000) requestAnimationFrame(sample);
          else resolve();
        };
        requestAnimationFrame(sample);
      });
      const sorted = intervals.toSorted((a, b) => a - b);
      return {
        samples: intervals.length,
        medianFrameMs: Number(sorted[Math.floor(sorted.length / 2)].toFixed(2)),
        p95FrameMs: Number(sorted[Math.floor(sorted.length * .95)].toFixed(2)),
        slowFrames: intervals.filter(ms => ms > 25).length,
        fps: Number((1000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length)).toFixed(1)),
        canvasCount: document.querySelectorAll('canvas').length,
      };
    });
    const metrics = (await cdp.send('Performance.getMetrics')).metrics;
    frame.jsHeapMB = Number(((metrics.find(item => item.name === 'JSHeapUsedSize')?.value || 0) / 1024 / 1024).toFixed(1));
    report[screen] = frame;
  }
  console.log(JSON.stringify({ viewport: '390x844 @2x, desktop Chrome emulation', cpuThrottle, report, errors }, null, 2));
} finally {
  await browser.close();
}
