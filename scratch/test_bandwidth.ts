import { getDcBandwidthManager } from '../src/util/dcBandwithManager.js';

async function main() {
  console.log('--- Testing Clashgram Bandwidth Concurrency Configuration ---');
  
  // Fetch manager for DC 1 under standard account (isPremium = false)
  const manager = getDcBandwidthManager(1, false);
  
  // Since maxConnections and maxActiveSize are private, we can read them by casting to any
  const mgrAny = manager as any;
  console.log(`Max Connections (Standard): ${mgrAny.maxConnections}`);
  console.log(`Max Active Request Size (Standard): ${mgrAny.maxActiveSize / (1024 * 1024)} MB`);
  
  // Fetch manager for DC 1 under premium account (isPremium = true)
  const managerPremium = getDcBandwidthManager(1, true);
  const mgrPremiumAny = managerPremium as any;
  console.log(`Max Connections (Premium/Bypassed): ${mgrPremiumAny.maxConnections}`);
  console.log(`Max Active Request Size (Premium/Bypassed): ${mgrPremiumAny.maxActiveSize / (1024 * 1024)} MB`);

  console.log('\n--- Simulating Parallel Worker Allocation ---');
  // Request 32 workers sequentially to see foreman index distribution
  const workerPromises = [];
  for (let i = 0; i < 32; i++) {
    workerPromises.push(manager.requestWorker(false, 1024 * 1024)); // 1MB request
  }
  
  const foremanIndices = await Promise.all(workerPromises);
  console.log('Allocated Foreman Indices (for 32 concurrent requests):');
  console.log(foremanIndices.join(', '));
  
  // Check active request size
  console.log(`Total Active Request Size: ${manager.activeRequestSize / (1024 * 1024)} MB`);
  
  // Release workers
  foremanIndices.forEach((foremanIndex) => {
    manager.releaseWorker(foremanIndex, 1024 * 1024);
  });
  console.log(`Total Active Request Size after release: ${manager.activeRequestSize} bytes`);
  console.log('--- Test Completed Successfully ---');
}

main().catch(console.error);
