#!/usr/bin/env node
/**
 * Generate images using DALL-E API
 * Usage: node generate-dalle-image.js [prompt] [options]
 * Options:
 *   --size <size>        Image size (256x256, 512x512, 1024x1024)
 *   --n <number>         Number of images to generate (1-10)
 *   --quality <quality>  Image quality (standard, hd)
 *   --output <path>      Output directory for images
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Get API key from environment variable
const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable not set');
  process.exit(1);
}

function generateImage(prompt, options = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: options.n || 1,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      response_format: 'url'
    });

    const req = https.request('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete the file if error
      reject(err);
    });
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
let prompt = args[0];
const options = {};

if (!prompt) {
  console.error('Error: Please provide a prompt');
  console.log('Usage: node generate-dalle-image.js "your prompt" [options]');
  process.exit(1);
}

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--size' && args[i + 1]) {
    options.size = args[i + 1];
    i++;
  } else if (args[i] === '--n' && args[i + 1]) {
    options.n = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--quality' && args[i + 1]) {
    options.quality = args[i + 1];
    i++;
  } else if (args[i] === '--output' && args[i + 1]) {
    options.output = args[i + 1];
    i++;
  }
}

// Generate image
console.log(`🎨 Generating image with DALL-E 3...`);
console.log(`Prompt: ${prompt}`);
console.log(`Options: ${JSON.stringify(options)}`);

generateImage(prompt, options)
  .then(async (response) => {
    console.log(`\n✅ Image generation successful!`);
    console.log(`Generated ${response.data.length} image(s)`);
    
    const outputDir = options.output || './output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (let i = 0; i < response.data.length; i++) {
      const imageUrl = response.data[i].url;
      const outputPath = path.join(outputDir, `dalle-image-${Date.now()}-${i + 1}.png`);
      
      console.log(`Downloading image ${i + 1}...`);
      await downloadImage(imageUrl, outputPath);
      console.log(`Saved to: ${outputPath}`);
    }
    
    console.log(`\n✨ All images saved to ${outputDir}`);
  })
  .catch((error) => {
    console.error(`\n❌ Error generating image: ${error.message}`);
    process.exit(1);
  });
