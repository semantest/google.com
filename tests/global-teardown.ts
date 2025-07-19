import fs from 'fs';
import path from 'path';

/**
 * Global teardown for E2E tests
 * Cleans up after all tests have run
 */
async function globalTeardown() {
  console.log('\n🧹 Starting global test teardown...');
  
  // Clean up old download files (keep last 5 test runs)
  const downloadsDir = path.join(__dirname, 'downloads');
  if (fs.existsSync(downloadsDir)) {
    const folders = fs.readdirSync(downloadsDir)
      .filter(f => fs.statSync(path.join(downloadsDir, f)).isDirectory())
      .sort((a, b) => parseInt(b) - parseInt(a)); // Sort by timestamp desc
    
    // Remove old test downloads
    const foldersToRemove = folders.slice(5);
    foldersToRemove.forEach(folder => {
      const folderPath = path.join(downloadsDir, folder);
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`🗑️  Removed old download folder: ${folder}`);
    });
  }
  
  // Generate test summary
  const resultsPath = path.join(__dirname, '../test-results/results.json');
  if (fs.existsSync(resultsPath)) {
    try {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      const stats = results.stats || {};
      
      console.log('\n📊 Test Summary:');
      console.log(`   Total Tests: ${stats.total || 0}`);
      console.log(`   ✅ Passed: ${stats.expected || 0}`);
      console.log(`   ❌ Failed: ${stats.unexpected || 0}`);
      console.log(`   ⏭️  Skipped: ${stats.skipped || 0}`);
      console.log(`   ⏱️  Duration: ${((stats.duration || 0) / 1000).toFixed(2)}s`);
      
      // Create summary report
      const summary = {
        timestamp: new Date().toISOString(),
        stats,
        environment: {
          node: process.version,
          platform: process.platform,
          ci: !!process.env.CI
        }
      };
      
      fs.writeFileSync(
        path.join(__dirname, '../test-results/summary.json'),
        JSON.stringify(summary, null, 2)
      );
      
    } catch (error) {
      console.log('⚠️  Could not generate test summary');
    }
  }
  
  console.log('\n✅ Global teardown completed');
}

export default globalTeardown;