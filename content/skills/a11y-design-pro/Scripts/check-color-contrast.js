#!/usr/bin/env node
/**
 * Check color contrast ratios for WCAG compliance
 * Usage: node check-color-contrast.js [foreground] [background] [options]
 * Options:
 *   --level <level>      WCAG level (A, AA, AAA)
 *   --format <format>    Output format (text, json)
 */

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format');
  }
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

function checkWCAGCompliance(contrastRatio, level = 'AA') {
  const thresholds = {
    'A': 3.0,
    'AA': 4.5,
    'AAA': 7.0
  };
  
  const threshold = thresholds[level] || thresholds['AA'];
  return contrastRatio >= threshold;
}

// Parse command line arguments
const args = process.argv.slice(2);
let foreground = args[0];
let background = args[1];
let level = 'AA';
let format = 'text';

for (let i = 2; i < args.length; i++) {
  if (args[i] === '--level' && args[i + 1]) {
    level = args[i + 1];
    i++;
  } else if (args[i] === '--format' && args[i + 1]) {
    format = args[i + 1];
    i++;
  }
}

if (!foreground || !background) {
  console.error('Error: Please provide foreground and background colors');
  console.log('Usage: node check-color-contrast.js #foreground #background [--level A|AA|AAA] [--format text|json]');
  process.exit(1);
}

try {
  const contrastRatio = getContrastRatio(foreground, background);
  const wcagAA = checkWCAGCompliance(contrastRatio, 'AA');
  const wcagAAA = checkWCAGCompliance(contrastRatio, 'AAA');
  const wcagA = checkWCAGCompliance(contrastRatio, 'A');
  
  const result = {
    foreground,
    background,
    contrastRatio: parseFloat(contrastRatio.toFixed(2)),
    compliance: {
      A: wcagA,
      AA: wcagAA,
      AAA: wcagAAA
    },
    passed: checkWCAGCompliance(contrastRatio, level)
  };
  
  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\n🎨 Color Contrast Check`);
    console.log(`Foreground: ${foreground}`);
    console.log(`Background: ${background}`);
    console.log(`\nContrast Ratio: ${result.contrastRatio}:1`);
    console.log(`\nWCAG Compliance:`);
    console.log(`  Level A: ${result.compliance.A ? '✓ Pass' : '✗ Fail'} (3.0:1)`);
    console.log(`  Level AA: ${result.compliance.AA ? '✓ Pass' : '✗ Fail'} (4.5:1)`);
    console.log(`  Level AAA: ${result.compliance.AAA ? '✓ Pass' : '✗ Fail'} (7.0:1)`);
    console.log(`\n${result.passed ? '✅' : '❌'} ${level} compliance: ${result.passed ? 'PASS' : 'FAIL'}`);
  }
  
  process.exit(result.passed ? 0 : 1);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
