const { chromium } = require('playwright');

async function testSystem() {
  console.log('🧪 Starting EduCore System Test...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    pages: [],
    errors: []
  };
  
  const PORT = process.env.PORT || 3003;

  const testUrls = [
    { url: `http://localhost:${PORT}`, name: 'Homepage' },
    { url: `http://localhost:${PORT}/login`, name: 'Login Page' },
    { url: `http://localhost:${PORT}/forgot-password`, name: 'Forgot Password' },
    { url: `http://localhost:${PORT}/reset-password`, name: 'Reset Password' },
    { url: `http://localhost:${PORT}/setup`, name: 'Setup Page' },
  ];

  for (const test of testUrls) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await page.goto(test.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = response.status();
      
      if (status >= 200 && status < 400) {
        console.log(`  ✅ ${test.name} loaded (${status})`);
        results.pages.push({ name: test.name, status: 'PASS', code: status });
      } else {
        console.log(`  ⚠️ ${test.name} returned ${status}`);
        results.pages.push({ name: test.name, status: 'WARN', code: status });
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} failed: ${error.message}`);
      results.errors.push({ page: test.name, error: error.message });
    }
  }

  // Test protected routes 
  const protectedUrls = [
    { url: `http://localhost:${PORT}/admin`, name: 'Admin Dashboard' },
    { url: `http://localhost:${PORT}/teacher`, name: 'Teacher Dashboard' },
    { url: `http://localhost:${PORT}/bursar`, name: 'Bursar Dashboard' },
    { url: `http://localhost:${PORT}/parent`, name: 'Parent Dashboard' },
  ];

  console.log('\n🔒 Testing Protected Routes:');
  for (const test of protectedUrls) {
    try {
      await page.goto(test.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const currentUrl = page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/setup')) {
        console.log(`  ✅ ${test.name} redirects correctly`);
        results.pages.push({ name: test.name, status: 'PASS', note: 'redirects to auth' });
      } else {
        console.log(`  ⚠️ ${test.name} went to ${currentUrl}`);
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} error: ${error.message}`);
    }
  }

  await browser.close();

  console.log('\n========================================');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================================');
  console.log(`Total Pages Tested: ${results.pages.length}`);
  console.log(`Errors: ${results.errors.length}`);
  
  console.log('\n✅ Passing:');
  results.pages.filter(p => p.status === 'PASS').forEach(p => console.log(`  - ${p.name}`));
  
  if (results.errors.length > 0) {
    console.log('\n❌ Failed:');
    results.errors.forEach(e => console.log(`  - ${e.page}: ${e.error}`));
  }

  console.log('\n========================================');
  console.log('🎉 System Test Complete!');
  console.log('========================================\n');

  return results;
}

testSystem().catch(console.error);