#!/usr/bin/env node
/**
 * Audit ARIA attributes in HTML files
 * Usage: node aria-audit.js [file.html] [options]
 * Options:
 *   --format <format>    Output format (text, json)
 */

const fs = require('fs');
const path = require('path');

function auditAria(html) {
  const issues = [];
  const warnings = [];
  
  // Check for missing alt attributes on images
  const imgRegex = /<img[^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const imgTag = imgMatch[0];
    if (!imgTag.includes('alt=')) {
      issues.push({
        element: 'img',
        issue: 'Missing alt attribute',
        snippet: imgTag.substring(0, 100)
      });
    } else if (imgTag.includes('alt=""')) {
      warnings.push({
        element: 'img',
        issue: 'Empty alt attribute (decorative image)',
        snippet: imgTag.substring(0, 100)
      });
    }
  }
  
  // Check for form inputs without labels
  const inputRegex = /<input[^>]*>/gi;
  let inputMatch;
  while ((inputMatch = inputRegex.exec(html)) !== null) {
    const inputTag = inputMatch[0];
    const hasId = inputTag.includes('id=');
    const hasAriaLabel = inputTag.includes('aria-label=');
    const hasAriaLabelledby = inputTag.includes('aria-labelledby=');
    
    if (!hasId && !hasAriaLabel && !hasAriaLabelledby) {
      issues.push({
        element: 'input',
        issue: 'Missing label (no id, aria-label, or aria-labelledby)',
        snippet: inputTag.substring(0, 100)
      });
    }
  }
  
  // Check for buttons without accessible names
  const buttonRegex = /<button[^>]*>/gi;
  let buttonMatch;
  while ((buttonMatch = buttonRegex.exec(html)) !== null) {
    const buttonTag = buttonMatch[0];
    const hasText = buttonTag.replace(/<button[^>]*>/, '').trim().length > 0;
    const hasAriaLabel = buttonTag.includes('aria-label=');
    
    if (!hasText && !hasAriaLabel) {
      issues.push({
        element: 'button',
        issue: 'Missing accessible name (no text or aria-label)',
        snippet: buttonTag.substring(0, 100)
      });
    }
  }
  
  // Check for aria-hidden on interactive elements
  const ariaHiddenRegex = /<(button|a|input|select|textarea)[^>]*aria-hidden="true"[^>]*>/gi;
  let ariaHiddenMatch;
  while ((ariaHiddenMatch = ariaHiddenRegex.exec(html)) !== null) {
    issues.push({
      element: ariaHiddenMatch[1],
      issue: 'Interactive element has aria-hidden="true"',
      snippet: ariaHiddenMatch[0].substring(0, 100)
    });
  }
  
  // Check for role attributes on semantic HTML
  const roleRegex = /<(header|nav|main|aside|footer)[^>]*role=/gi;
  let roleMatch;
  while ((roleMatch = roleRegex.exec(html)) !== null) {
    warnings.push({
      element: roleMatch[1],
      issue: 'Redundant role attribute on semantic HTML element',
      snippet: roleMatch[0].substring(0, 100)
    });
  }
  
  return { issues, warnings };
}

// Parse command line arguments
const args = process.argv.slice(2);
let filePath = args[0];
let format = 'text';

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--format' && args[i + 1]) {
    format = args[i + 1];
    i++;
  }
}

if (!filePath) {
  console.error('Error: Please provide an HTML file path');
  console.log('Usage: node aria-audit.js file.html [--format text|json]');
  process.exit(1);
}

try {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  const html = fs.readFileSync(filePath, 'utf8');
  const { issues, warnings } = auditAria(html);
  
  const result = {
    file: filePath,
    issues: issues,
    warnings: warnings,
    summary: {
      totalIssues: issues.length,
      totalWarnings: warnings.length,
      passed: issues.length === 0
    }
  };
  
  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\n🔍 ARIA Audit: ${path.basename(filePath)}`);
    console.log(`\n❌ Issues (${result.summary.totalIssues}):`);
    if (issues.length === 0) {
      console.log('  No issues found');
    } else {
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.element}: ${issue.issue}`);
        console.log(`     ${issue.snippet}`);
      });
    }
    
    console.log(`\n⚠️  Warnings (${result.summary.totalWarnings}):`);
    if (warnings.length === 0) {
      console.log('  No warnings');
    } else {
      warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning.element}: ${warning.issue}`);
        console.log(`     ${warning.snippet}`);
      });
    }
    
    console.log(`\n${result.summary.passed ? '✅' : '❌'} Result: ${result.summary.passed ? 'PASS' : 'FAIL'}`);
  }
  
  process.exit(result.summary.passed ? 0 : 1);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
