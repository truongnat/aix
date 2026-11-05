#!/usr/bin/env node
/**
 * Generate AI color palette based on brand or style
 * Usage: node generate-color-palette.js [options]
 * Options:
 *   --base-color <hex>    Base color for palette generation
 *   --style <style>      Style of palette (vibrant, muted, pastel, monochromatic)
 *   --count <number>      Number of colors to generate (default: 5)
 */

const colorsys = require('colorsys');

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
}

function hsvToHex(h, s, v) {
  const { r, g, b } = colorsys.hsv_to_rgb(h, s, v);
  return rgbToHex(r, g, b);
}

function generatePalette(baseColor, style = 'vibrant', count = 5) {
  const { r, g, b } = hexToRgb(baseColor);
  const [h, s, v] = colorsys.rgb_to_hsv(r, g, b);
  
  const palette = [baseColor];
  
  for (let i = 1; i < count; i++) {
    let newH, newS, newV;
    
    switch (style) {
      case 'vibrant':
        newH = (h + (i * 0.15)) % 1.0;
        newS = Math.max(0.6, Math.min(1.0, s + 0.1));
        newV = Math.max(0.6, Math.min(1.0, v + 0.1));
        break;
      case 'muted':
        newH = (h + (i * 0.12)) % 1.0;
        newS = Math.max(0.1, Math.min(0.5, s - 0.1));
        newV = Math.max(0.3, Math.min(0.7, v - 0.1));
        break;
      case 'pastel':
        newH = (h + (i * 0.1)) % 1.0;
        newS = Math.max(0.2, Math.min(0.5, s));
        newV = Math.max(0.8, Math.min(1.0, v + 0.1));
        break;
      case 'monochromatic':
        newH = h;
        newS = s;
        newV = Math.max(0.2, Math.min(1.0, v + (i * 0.15) - 0.3));
        break;
      default:
        newH = (h + (i * 0.1)) % 1.0;
        newS = s;
        newV = v;
    }
    
    palette.push(hsvToHex(newH, newS, newV));
  }
  
  return palette;
}

function calculateContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const luminance1 = 0.2126 * rgb1.r + 0.7152 * rgb1.g + 0.0722 * rgb1.b;
  const luminance2 = 0.2126 * rgb2.r + 0.7152 * rgb2.g + 0.0722 * rgb2.b;
  
  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};
let baseColor = '#3b82f6'; // Default blue
let style = 'vibrant';
let count = 5;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--base-color' && args[i + 1]) {
    baseColor = args[i + 1];
    i++;
  } else if (args[i] === '--style' && args[i + 1]) {
    style = args[i + 1];
    i++;
  } else if (args[i] === '--count' && args[i + 1]) {
    count = parseInt(args[i + 1]);
    i++;
  }
}

// Generate palette
const palette = generatePalette(baseColor, style, count);

// Output results
console.log(`\n🎨 AI Color Palette (${style})`);
console.log(`Base Color: ${baseColor}`);
console.log(`\nGenerated Palette:`);
palette.forEach((color, index) => {
  const contrast = calculateContrastRatio(color, '#ffffff');
  const wcagAA = contrast >= 4.5 ? '✓ AA' : '✗ AA';
  const wcagAAA = contrast >= 7.0 ? '✓ AAA' : '✗ AAA';
  console.log(`  ${index + 1}. ${color} (Contrast with white: ${contrast.toFixed(2)}) [${wcagAA}, ${wcagAAA}]`);
});

console.log(`\nCSS Variables:`);
palette.forEach((color, index) => {
  console.log(`  --color-${index + 1}: ${color};`);
});

console.log(`\nTailwind Config:`);
palette.forEach((color, index) => {
  console.log(`  'color-${index + 1}': '${color}',`);
});
