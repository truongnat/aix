import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Analyzes a document (PDF, Word, Excel, PowerPoint, etc.) and converts it to Markdown
 * using Microsoft's markitdown CLI.
 * 
 * Requirement: pip install 'markitdown[all]'
 */
function analyzeDocument(filePath: string) {
  if (!filePath) {
    console.error('Usage: npm run analyze-doc <path-to-file>');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found at ${absolutePath}`);
    process.exit(1);
  }

  // Check if markitdown is installed
  try {
    execSync('markitdown --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: "markitdown" CLI is not installed or not in PATH.');
    console.error('Please install it using: pip install "markitdown[all]"');
    process.exit(1);
  }

  console.log(`Analyzing document: ${absolutePath}...`);
  console.log('---');

  try {
    // Execute markitdown and capture standard output
    const output = execSync(`markitdown "${absolutePath}"`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 50 });
    console.log(output);
  } catch (error: any) {
    console.error(`Failed to analyze document: ${error.message}`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
analyzeDocument(args[0]);
