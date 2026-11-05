#!/usr/bin/env node
/**
 * Measure carbon footprint of a website
 * Usage: node measure-carbon.js [url] [options]
 * Options:
 *   --format <format>    Output format (text, json)
 */

const https = require('https');

function measureWebsiteCarbon(url) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.websitecarbon.com/site?url=${encodeURIComponent(url)}`;
    
    https.get(apiUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
let url = args[0];
let format = 'text';

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--format' && args[i + 1]) {
    format = args[i + 1];
    i++;
  }
}

if (!url) {
  console.error('Error: Please provide a URL');
  console.log('Usage: node measure-carbon.js https://example.com [--format text|json]');
  process.exit(1);
}

try {
  console.log(`🌍 Measuring carbon footprint for: ${url}`);
  
  measureWebsiteCarbon(url)
    .then(data => {
      const result = {
        url: url,
        co2: data.c,
        rating: data.rating,
        green: data.green,
        bytes: data.bytes,
        cleanerThan: data.cleanerThan,
        timestamp: new Date().toISOString()
      };
      
      if (format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n📊 Carbon Footprint Report`);
        console.log(`\nURL: ${url}`);
        console.log(`CO2: ${data.c}g`);
        console.log(`Rating: ${data.rating}`);
        console.log(`Green Hosting: ${data.green ? '✅ Yes' : '❌ No'}`);
        console.log(`Page Size: ${(data.bytes / 1024).toFixed(2)} KB`);
        console.log(`Cleaner Than: ${data.cleanerThan}%`);
        console.log(`\nRating Scale:`);
        console.log(`  A+   < 0.05g CO2`);
        console.log(`  A    < 0.10g CO2`);
        console.log(`  B    < 0.30g CO2`);
        console.log(`  C    < 0.50g CO2`);
        console.log(`  D    < 0.80g CO2`);
        console.log(`  E    < 1.00g CO2`);
        console.log(`  F    > 1.00g CO2`);
      }
    })
    .catch(error => {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    });
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
