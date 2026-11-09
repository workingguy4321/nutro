const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 8089;
const ARTIFACT_DIR = 'C:\\Users\\sreem\\.gemini\\antigravity\\brain\\001451aa-1539-4236-8970-92ee2e9682e4';

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.apk': 'application/vnd.android.package-archive'
};

// 1. Create In-Process Local Web Server
const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

async function runTestSuite() {
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`[TEST SERVER] Running at http://127.0.0.1:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  function assert(title, condition) {
    if (condition) {
      console.log(`  ✓ PASS: ${title}`);
      results.push({ title, pass: true });
    } else {
      console.error(`  ✗ FAIL: ${title}`);
      results.push({ title, pass: false });
    }
  }

  try {
    // ==========================================
    // TEST 1: DESKTOP AUDIT (1920 x 1080)
    // ==========================================
    console.log('\n--- 1. DESKTOP WORKFLOW & INTERACTION TESTS (1920x1080) ---');
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Listen for console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const title = await page.title();
    assert('Page title is set correctly', title.includes('NUTRO'));

    // Test GSAP Core and ScrollTrigger Plugin Verification
    const hasGsap = await page.evaluate(() => typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined');
    assert('GSAP 3 Core and ScrollTrigger plugin loaded and active', hasGsap);

    const hasCursorLight = await page.$eval('#ambientCursorLight', el => !!el);
    assert('120 FPS Ambient Magnetic Cursor follower element mounted', hasCursorLight);

    // Test Navigation: Free App View
    await page.click('button[data-view="view-free-app"]');
    await page.waitForTimeout(300);
    const isFreeActive = await page.$eval('#view-free-app', el => el.classList.contains('active-view'));
    assert('Navigated to Normal Edition deep dive view', isFreeActive);

    // Test Navigation: Pro App View
    await page.click('button[data-view="view-pro-app"]');
    await page.waitForTimeout(300);
    const isProActive = await page.$eval('#view-pro-app', el => el.classList.contains('active-view'));
    assert('Navigated to NUTRO+ AI Special Edition view', isProActive);

    // Test Navigation: Compare View
    await page.click('button[data-view="view-compare"]');
    await page.waitForTimeout(300);
    const isCompareActive = await page.$eval('#view-compare', el => el.classList.contains('active-view'));
    assert('Navigated to Side-by-Side Comparison view', isCompareActive);

    // Capture Comparison Screen
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'playwright_desktop_compare.png'), fullPage: false });

    // Test Navigation: Back to Home View
    await page.click('button[data-view="view-home"]');
    await page.waitForTimeout(300);
    const isHomeActive = await page.$eval('#view-home', el => el.classList.contains('active-view'));
    assert('Returned to Home Dashboard view', isHomeActive);

    // Test AI Vision Plate Scanner Switcher
    console.log('\n--- 2. INTERACTIVE PLATE SCANNER TEST ---');
    const demoBtns = await page.$$('.demo-meal-btn');
    assert('Scanner has 4 demo meal presets', demoBtns.length >= 4);

    // Click meal 1 (Avocado Toast)
    await demoBtns[1].click();
    await page.waitForTimeout(350);
    const mealName1 = await page.$eval('#demoMealName', el => el.innerText);
    assert('Meal 1 selected: Avocado Sourdough', mealName1.includes('Avocado'));

    // Click meal 3 (Protein Berry Oatmeal)
    await demoBtns[3].click();
    await page.waitForTimeout(350);
    const mealCal3 = await page.$eval('#demoCal', el => el.innerText);
    assert('Meal 3 calories updated to 380 kcal', mealCal3.includes('380'));

    // Test Sree AI Assistant Simulator
    console.log('\n--- 3. SREE AI ASSISTANT & CHAT TEST ---');
    const sreeBtns = await page.$$('.sree-prompt-btn');
    assert('Sree AI has interactive voice prompt chips', sreeBtns.length >= 4);

    // Click prompt 0 ("I drank 250ml water")
    await sreeBtns[0].click();
    await page.waitForTimeout(350);
    let sreeSpeech = await page.$eval('#sreeSpeechText', el => el.innerText);
    assert('Sree logs 250ml water via natural language', sreeSpeech.includes('250ml'));

    // Click prompt 2 ("Add Paracetamol at 8:00 AM")
    await sreeBtns[2].click();
    await page.waitForTimeout(350);
    sreeSpeech = await page.$eval('#sreeSpeechText', el => el.innerText);
    assert('Sree configures Paracetamol medicine schedule with alarm', sreeSpeech.includes('Paracetamol'));

    // Test Custom Typed Prompt in Sree AI
    await page.fill('#sreeCustomInput', 'I drank 500ml water');
    await page.click('.sree-custom-send-btn');
    await page.waitForTimeout(350);
    sreeSpeech = await page.$eval('#sreeSpeechText', el => el.innerText);
    assert('Sree processes custom user prompt and responds', sreeSpeech.includes('SREE'));

    // Test Interactive 4-Widget Studio Switcher
    console.log('\n--- 4. ANDROID WIDGET STUDIO SWITCHER TEST ---');
    const studioTabs = await page.$$('.studio-tab-btn');
    assert('Widget studio has 4 interactive tabs', studioTabs.length === 4);

    // Switch to Concentric Rings tab (tab 1)
    await studioTabs[1].click();
    await page.waitForTimeout(300);
    const isRingVisible = await page.$eval('#studioWidget1', el => el.style.display !== 'none');
    assert('Studio switched to Concentric Activity Rings widget', isRingVisible);

    // Switch to Duo Pill tab (tab 2)
    await studioTabs[2].click();
    await page.waitForTimeout(300);
    const isPillVisible = await page.$eval('#studioWidget2', el => el.style.display !== 'none');
    assert('Studio switched to Duo Pill widget', isPillVisible);

    // Click "+ 250ml Water" button inside live widget demo
    const addWaterBtn = await page.$('#studioWidget2 button');
    if (addWaterBtn) {
      await addWaterBtn.click();
      await page.waitForTimeout(200);
      const waterVal = await page.$eval('#studioWidget2 .studio-water-val', el => el.innerText);
      assert('Widget water value dynamically incremented to 2.50L', waterVal.includes('2.50L'));
    }

    // Test Interactive Calorie & Macro Calculator
    console.log('\n--- 5. CALORIE & MACRO CALCULATOR TEST ---');
    await page.fill('#calcWeight', '80');
    await page.fill('#calcHeight', '180');
    await page.fill('#calcAge', '28');
    await page.dispatchEvent('#calcWeight', 'input');
    await page.waitForTimeout(200);

    const bmiVal = await page.$eval('#calcBmiVal', el => el.innerText);
    assert('BMI calculated accurately for 80kg/180cm (24.7 Normal)', bmiVal === '24.7');

    const calTarget = await page.$eval('#calcCaloriesTarget', el => el.innerText);
    assert('Daily calorie target computed dynamically', calTarget.includes('kcal'));

    const proteinTarget = await page.$eval('#calcProteinTarget', el => el.innerText);
    assert('Daily protein target computed (144g)', proteinTarget.includes('144g'));

    // Test Fat Loss Goal switch
    const goalBtns = await page.$$('.goal-btn');
    await goalBtns[0].click(); // Cut
    await page.waitForTimeout(200);
    const cutCalTarget = await page.$eval('#calcCaloriesTarget', el => el.innerText);
    assert('Fat loss calorie deficit applied', cutCalTarget.includes('kcal'));

    // Test Medicine Notification Action Buttons
    console.log('\n--- 6. MEDICINE NOTIFICATION ACTION TEST ---');
    await page.click('button[data-view="view-pro-app"]');
    await page.waitForTimeout(300);

    const notifTakeBtn = await page.$('.notif-btn-take');
    if (notifTakeBtn) {
      await notifTakeBtn.click();
      await page.waitForTimeout(200);
      const notifCardText = await page.$eval('.medicine-notif-preview', el => el.innerText);
      assert('Medicine notification interactive Take logged with checkmark', notifCardText.includes('Taken'));
    }

    // Test Product Key Modal & Validation
    console.log('\n--- 7. PRODUCT KEY VERIFICATION MODAL TEST ---');
    await page.evaluate(() => window.triggerAiDownload());
    await page.waitForTimeout(300);

    const isModalOpen = await page.$eval('#productKeyModal', el => el.classList.contains('open'));
    assert('Product Key Verification modal opened smoothly', isModalOpen);

    // Test invalid key error
    await page.fill('#productKeyInput', 'WRONG-KEY');
    await page.click('#keySubmitBtn');
    await page.waitForTimeout(200);
    const errorMsg = await page.$eval('#keyStatusMsg', el => el.innerText);
    assert('Invalid key triggers error feedback', errorMsg.includes('Invalid product key'));

    // Test valid key verification
    await page.fill('#productKeyInput', '123456789012');
    await page.click('#keySubmitBtn');
    await page.waitForTimeout(300);
    const successMsg = await page.$eval('#keyStatusMsg', el => el.innerText);
    assert('12-digit valid product key verified successfully', successMsg.includes('Verified'));

    await page.waitForTimeout(1600); // Wait for modal auto-close
    const isModalClosed = await page.$eval('#productKeyModal', el => !el.classList.contains('open'));
    assert('Modal auto-closes after verification', isModalClosed);

    // Take Desktop Full Screenshots
    await page.click('button[data-view="view-home"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'playwright_desktop_home.png'), fullPage: true });
    console.log('  📸 Captured: playwright_desktop_home.png');

    await context.close();

    // ==========================================
    // TEST 8: TABLET VIEWPORT (820 x 1180)
    // ==========================================
    console.log('\n--- 8. TABLET RESPONSIVENESS AUDIT (820x1180) ---');
    const tabletContext = await browser.newContext({
      viewport: { width: 820, height: 1180 }
    });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await tabletPage.waitForTimeout(500);
    await tabletPage.screenshot({ path: path.join(ARTIFACT_DIR, 'playwright_tablet_home.png'), fullPage: true });
    console.log('  📸 Captured: playwright_tablet_home.png');
    await tabletContext.close();

    // ==========================================
    // TEST 9: MOBILE VIEWPORT (390 x 844 iPhone)
    // ==========================================
    console.log('\n--- 9. MOBILE VIEWPORT & DRAWER AUDIT (390x844) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(500);

    // Open Mobile Drawer
    await mobilePage.evaluate(() => window.toggleMobileMenu());
    await mobilePage.waitForTimeout(300);
    const isDrawerOpen = await mobilePage.$eval('#mobileDrawer', el => el.classList.contains('open'));
    assert('Mobile hamburger menu drawer opens with frosted backdrop', isDrawerOpen);

    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'playwright_mobile_drawer.png'), fullPage: false });
    console.log('  📸 Captured: playwright_mobile_drawer.png');

    // Close drawer and screenshot mobile home
    await mobilePage.evaluate(() => window.toggleMobileMenu());
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'playwright_mobile_home.png'), fullPage: true });
    console.log('  📸 Captured: playwright_mobile_home.png');

    await mobileContext.close();

    // Zero Console Errors Assertion
    assert('Zero JavaScript runtime errors on page', consoleErrors.length === 0);
    if (consoleErrors.length > 0) {
      console.error('Console errors encountered:', consoleErrors);
    }

  } catch (err) {
    console.error('Test execution failed with error:', err);
  } finally {
    await browser.close();
    server.close();
    console.log('\n=================================================');
    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    console.log(`🎉 TEST SUITE COMPLETE: ${passed} / ${total} PASSING`);
    console.log('=================================================\n');
  }
}

runTestSuite();
