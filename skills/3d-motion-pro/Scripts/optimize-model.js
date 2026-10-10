#!/usr/bin/env node
/**
 * Optimize 3D models for web (GLTF/GLB compression)
 * Usage: node optimize-model.js [input] [options]
 * Options:
 *   --output <path>      Output file path
 *   --format <format>    Output format (glb, gltf)
 *   --quality <quality>  Compression quality (low, medium, high)
 */

const fs = require('fs');
const { execSync } = require('child_process');

function checkGltfPipeline() {
  try {
    execSync('gltf-transform-cli --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function optimizeModel(inputPath, outputPath, format = 'glb', quality = 'medium') {
  const compressionMap = {
    low: {
      draco: true,
      dracoLevel: 6,
      textureQuality: 0.5
    },
    medium: {
      draco: true,
      dracoLevel: 7,
      textureQuality: 0.7
    },
    high: {
      draco: true,
      dracoLevel: 9,
      textureQuality: 0.9
    }
  };
  
  const settings = compressionMap[quality];
  
  if (!checkGltfPipeline()) {
    console.error('Error: gltf-transform-cli not installed');
    console.log('Install with: npm install -g @gltf-transform/cli');
    process.exit(1);
  }
  
  let command = `gltf-transform-cli ${inputPath} ${outputPath}`;
  
  // Add Draco compression
  if (settings.draco) {
    command += ' --draco';
    command += ` --draco.level ${settings.dracoLevel}`;
  }
  
  // Add texture compression
  command += ' --texture-compress webp';
  command += ` --texture-quality ${settings.textureQuality}`;
  
  // Add other optimizations
  command += ' --meshopt';
  command += ' --simplify';
  command += ' --sort';
  
  try {
    console.log(`🔧 Optimizing model: ${inputPath}`);
    console.log(`Settings: quality=${quality}, format=${format}`);
    console.log(`\nRunning: ${command}`);
    
    execSync(command, { stdio: 'inherit' });
    
    // Get file sizes
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    console.log(`\n✅ Optimization complete`);
    console.log(`Original size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`Optimized size: ${(optimizedSize / 1024).toFixed(2)} KB`);
    console.log(`Size reduction: ${reduction}%`);
    console.log(`Output: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error optimizing model: ${error.message}`);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let inputPath = args[0];
let outputPath;
let format = 'glb';
let quality = 'medium';

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) {
    outputPath = args[i + 1];
    i++;
  } else if (args[i] === '--format' && args[i + 1]) {
    format = args[i + 1];
    i++;
  } else if (args[i] === '--quality' && args[i + 1]) {
    quality = args[i + 1];
    i++;
  }
}

if (!inputPath) {
  console.error('Error: Please provide input model path');
  console.log('Usage: node optimize-model.js input.[glb|gltf] [--output path] [--format glb|gltf] [--quality low|medium|high]');
  process.exit(1);
}

if (!outputPath) {
  const ext = format === 'glb' ? '.glb' : '.gltf';
  const basename = path.basename(inputPath, path.extname(inputPath));
  outputPath = `${basename}-optimized${ext}`;
}

try {
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }
  
  optimizeModel(inputPath, outputPath, format, quality);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
