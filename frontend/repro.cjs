const { chromium } = require('playwright');

async function choose(page, modeIndex, spotName) {
  await page.locator('.steps span').nth(modeIndex).click();
  await page.locator('.mini-card').filter({ hasText: spotName }).first().click();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1720, height: 980 } });

  await page.goto('http://127.0.0.1:5173/recommend', { waitUntil: 'networkidle' });

  await choose(page, 0, '河南博物院');
  await choose(page, 1, '清明上河园');
  await choose(page, 2, '龙门石窟');
  await page.locator('button.primary').click();
  await page.waitForURL('**/route');
  const first = await page.evaluate(() => JSON.parse(localStorage.getItem('spot-planner-state') || '{}'));

  await page.goto('http://127.0.0.1:5173/recommend', { waitUntil: 'networkidle' });
  await choose(page, 0, '少林寺');
  await choose(page, 1, '包公祠');
  await choose(page, 2, '殷墟');
  await page.locator('button.primary').click();
  await page.waitForURL('**/route');
  const second = await page.evaluate(() => JSON.parse(localStorage.getItem('spot-planner-state') || '{}'));

  console.log(JSON.stringify({
    firstPlan: first.currentPlan?.routeSpotNames,
    secondPlan: second.currentPlan?.routeSpotNames,
    firstAt: first.currentPlan?.confirmedAt,
    secondAt: second.currentPlan?.confirmedAt,
  }, null, 2));

  await browser.close();
})();
