#!/usr/bin/env node
/**
 * React Component Generator
 * Generates React/Next.js component files with TypeScript and Tailwind CSS.
 *
 * Usage:
 *   node component-generator.js Button --dir src/components/ui
 *   node component-generator.js ProductCard --type client --with-test
 *   node component-generator.js UserProfile --type server --with-story
 *   node component-generator.js useAuth --type hook
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

function toPascalCase(name) {
  return name.replace(/[-_](.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toUpperCase());
}

function toKebabCase(name) {
  return name.replace(/([A-Z])/g, (_, c, i) => (i > 0 ? '-' : '') + c.toLowerCase());
}

function clientTemplate(name) {
  return `'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${name}({ className, children }: ${name}Props) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}
`;
}

function serverTemplate(name) {
  return `import { cn } from '@/lib/utils';

interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export async function ${name}({ className, children }: ${name}Props) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}
`;
}

function hookTemplate(name) {
  return `import { useState, useEffect } from 'react';

interface Use${name}Options {
  // Add options here
}

interface Use${name}Return {
  isLoading: boolean;
  error: Error | null;
}

export function use${name}(options: Use${name}Options = {}): Use${name}Return {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Effect logic here
  }, []);

  return {
    isLoading,
    error,
  };
}
`;
}

function testTemplate(name) {
  return `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name}>Test content</${name}>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<${name} className="custom-class">Content</${name}>);
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-class');
  });

  // Add more tests here
});
`;
}

function storyTemplate(name) {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {
    children: 'Default content',
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'bg-blue-100 p-4',
    children: 'Styled content',
  },
};
`;
}

function indexTemplate(name) {
  return `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`;
}

function generateComponent({ name, outputDir, type = 'client', withTest = false, withStory = false, withIndex = true, flat = false, dryRun = false }) {
  const pascalName = toPascalCase(name);
  const componentDir = flat ? outputDir : join(outputDir, pascalName);
  const filesCreated = [];

  if (!dryRun) mkdirSync(componentDir, { recursive: true });

  const isHook = type === 'hook';
  const mainFile = isHook ? join(componentDir, `use${pascalName}.ts`) : join(componentDir, `${pascalName}.tsx`);
  const mainContent = type === 'client' ? clientTemplate(pascalName) : type === 'server' ? serverTemplate(pascalName) : hookTemplate(pascalName);

  if (!dryRun) writeFileSync(mainFile, mainContent);
  filesCreated.push(mainFile);

  if (withTest && !isHook) {
    const testFile = join(componentDir, `${pascalName}.test.tsx`);
    if (!dryRun) writeFileSync(testFile, testTemplate(pascalName));
    filesCreated.push(testFile);
  }

  if (withStory && !isHook) {
    const storyFile = join(componentDir, `${pascalName}.stories.tsx`);
    if (!dryRun) writeFileSync(storyFile, storyTemplate(pascalName));
    filesCreated.push(storyFile);
  }

  if (withIndex && !flat) {
    const indexFile = join(componentDir, 'index.ts');
    if (!dryRun) writeFileSync(indexFile, indexTemplate(pascalName));
    filesCreated.push(indexFile);
  }

  return { name: pascalName, type, directory: componentDir, files: filesCreated };
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    dir: { type: 'string', short: 'd', default: 'src/components' },
    type: { type: 'string', short: 't', default: 'client' },
    'with-test': { type: 'boolean', default: false },
    'with-story': { type: 'boolean', default: false },
    'no-index': { type: 'boolean', default: false },
    flat: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
  },
  allowPositionals: true,
});

const name = positionals[0];
if (!name) { console.error('Usage: node component-generator.js <ComponentName> [options]'); process.exit(1); }

const validTypes = ['client', 'server', 'hook'];
if (!validTypes.includes(values.type)) { console.error(`Invalid type. Choose from: ${validTypes.join(', ')}`); process.exit(1); }

const pascalName = toPascalCase(name);

if (values['dry-run']) {
  console.log('\nDry run - would generate:');
  console.log(`  Component: ${pascalName}`);
  console.log(`  Type: ${values.type}`);
  console.log(`  Directory: ${values.flat ? values.dir : join(values.dir, pascalName)}`);
  console.log(`  Test: ${values['with-test'] ? 'Yes' : 'No'}`);
  console.log(`  Story: ${values['with-story'] ? 'Yes' : 'No'}`);
  process.exit(0);
}

const result = generateComponent({
  name,
  outputDir: resolve(values.dir),
  type: values.type,
  withTest: values['with-test'],
  withStory: values['with-story'],
  withIndex: !values['no-index'],
  flat: values.flat,
});

if (values.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Component Generated: ${result.name}`);
  console.log('='.repeat(50));
  console.log(`Type: ${result.type}`);
  console.log(`Directory: ${result.directory}`);
  console.log('\nFiles created:');
  for (const f of result.files) console.log(`  - ${f}`);
  console.log('='.repeat(50));
  if (result.type !== 'hook') {
    console.log('\nUsage:');
    console.log(`  import { ${result.name} } from '@/components/${result.name}';`);
    console.log(`\n  <${result.name}>Content</${result.name}>`);
  } else {
    console.log('\nUsage:');
    console.log(`  import { use${result.name} } from '@/hooks/use${result.name}';`);
    console.log(`\n  const { isLoading, error } = use${result.name}();`);
  }
}
