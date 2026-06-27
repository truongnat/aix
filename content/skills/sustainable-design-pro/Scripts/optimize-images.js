#!/usr/bin/env node
/**
 * Optimize images for web (reduce carbon footprint)
 * Usage: node optimize-images.js [input-dir] [options]
 * Options:
 *   --output <path>      Output directory (default: ./optimized)
 *   --format <format>    Output format (webp, avif, jpeg)
 *   --quality <quality>  Compression quality (1-100, default: 80)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkSharp() {
  try {
    execSync('sharp --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function optimizeImage(inputPath, outputPath, format = 'webp', quality = 80) {
  return new Promise((resolve, reject) => {
    try {
      execSync(`sharp ${inputPath} ${outputPath} --${format} --quality ${quality}`, { stdio: 'ignore' });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function getImagesInDirectory(dir) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  const images = [];
  
  function scanDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (imageExtensions.includes(path.extname(file).toLowerCase())) {
        images.push(fullPath);
      }
    });
  }
  
  scanDirectory(dir);
  return images;
}

// Parse command line arguments
const args = process.argv.slice(2);
let inputDir = args[0];
let outputDir = './optimized';
let format = 'webp';
let quality = '80';

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) {
    outputDir = args[i + 1];
    i++;
  } else if (args[i] === '--format' && args[i + 1]) {
    format = args[i + 1];
    i++;
  } else if (args[i] === '--quality' && args[i + 1]) {
    quality = args[i + 1];
    i++;
  }
}

if (!inputDir) {
  console.error('Error: Please provide input directory');
  console.log('Usage: node optimize-images.js [input-dir] [--output path] [--format webp|avif|jpeg] [--quality 1-100]');
  process.exit(1);
}

try {
  if (!fs.existsSync(inputDir)) {
    console.error(`Error: Input directory not found: ${inputDir}`);
    process.exit(1);
  }
  
  if (!checkSharp()) {
    console.error('Error: sharp not installed');
    console.log('Install with: npm install sharp');
    process.exit(1);
  }
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get all images
  const images = getImagesInDirectory(inputDir);
  
  if (images.length === 0) {
    console.log('No images found in directory');
    process.exit(0);
  }
  
  console.log(`🖼️  Optimizing ${images.length} images...`);
  console.log(`Input: ${inputDir}`);
  console.log(`Output: ${outputDir}`);
  console.log(`Format: ${format}`);
  console.log(`Quality: ${quality}`);
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const image of images) {
    const relativePath = path.relative(inputDir, image);
    const outputPath = path.join(outputDir, relativePath.replace(/\.(jpg|jpeg|png|gif|bmp)$/i, `.${format}`));
    
    // Create output subdirectories if needed
    const outputSubDir = path.dirname(outputPath);
    if (!fs.existsSync(outputSubDir)) {
      fs.mkdirSync(outputSubDir, { recursive: true });
    }
    
    const originalSize = fs.statSync(image).size;
    totalOriginalSize += originalSize;
    
    try {
      await optimizeImage(image, outputPath, format, parseInt(quality));
      
      const optimizedSize = fs.statSync(outputPath).size;
      totalOptimizedSize += optimizedSize;
      
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
      console.log(`✓ ${relativePath}: ${(originalSize / 1024).toFixed(2)}KB → ${(optimizedSize / 1024).toFixed(2)}KB (${savings}% savings)`);
    } catch (error) {
      console.error(`✗ ${relativePath}: ${error.message}`);
    }
  }
  
  const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(2);
  const carbonPerGB = 0.44; // grams of CO2 per GB
  const carbonSaved = ((totalOriginalSize - totalOptimizedSize) / (1024 * 1024 * 1024)) * carbonPerGB;
  
  console.log(`\n📊 Optimization Summary:`);
  console.log(`Total images: ${images.length}`);
  console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total savings: ${totalSavings}%`);
  console.log(`Carbon saved: ${carbonSaved.toFixed(4)}g CO2`);
  console.log(`\n✨ All optimized images saved to: ${outputDir}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
