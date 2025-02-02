import { test, expect } from '@playwright/test';
import fs from 'fs/promises';

test.describe('Performance Tests', () => {
  test('Measure page load performance', async ({ page, context }) => {
    const traceFilePath = 'trace-home-page.json';
    // Start tracing
    await context.tracing.start({ screenshots: true, snapshots: true });

    // Navigate to the home page
    await page.goto('/');

    // Stop tracing and save it to a file
    await context.tracing.stop({ path: traceFilePath });

    // Measure performance metrics
    const metrics = await page.evaluate(() => JSON.stringify(window.performance));
    console.log('Performance Metrics:', metrics);

    // Validate some performance metrics
    const performance = JSON.parse(metrics);
    expect(performance.timing.domContentLoadedEventEnd).toBeLessThan(2000000000000); 
    // Delete the trace file
    await fs.unlink(traceFilePath);
  });

  test('Measure product page load performance', async ({ page, context }) => {
    const traceFilePath = 'trace-product-page.json';
    // Start tracing
    await context.tracing.start({ screenshots: true, snapshots: true });

    // Navigate to a product page
    await page.goto('/prod.html?idp_=1');

    // Stop tracing and save it to a file
    await context.tracing.stop({ path: traceFilePath });

    // Measure performance metrics
    const metrics = await page.evaluate(() => JSON.stringify(window.performance));
    console.log('Performance Metrics:', metrics);

    // Validate some performance metrics
    const performance = JSON.parse(metrics);
    expect(performance.timing.domContentLoadedEventEnd).toBeLessThan(2000000000000); 
    // Delete the trace file
    await fs.unlink(traceFilePath);
  });
});