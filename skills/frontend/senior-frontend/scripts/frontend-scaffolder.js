#!/usr/bin/env node
/**
 * Frontend Project Scaffolder
 * Generates a complete Next.js/React project structure with TypeScript and Tailwind CSS.
 *
 * Usage:
 *   node frontend-scaffolder.js my-app --template nextjs
 *   node frontend-scaffolder.js dashboard --template react --features auth,api
 *   node frontend-scaffolder.js landing --template nextjs --dry-run
 *   node frontend-scaffolder.js --list-templates
 *   node frontend-scaffolder.js --list-features
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const FILE_CONTENTS = {
  ROOT_LAYOUT: `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'My App',
  description: 'Built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={\`\${inter.variable} font-sans antialiased\`}>
        {children}
      </body>
    </html>
  );
}
`,
  HOME_PAGE: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome</h1>
      <p className="mt-4 text-lg text-gray-600">
        Get started by editing app/page.tsx
      </p>
    </main>
  );
}
`,
  GLOBALS_CSS: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
`,
  UI_BUTTON: `import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
          variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          variant === 'outline' && 'border border-input bg-background hover:bg-accent',
          variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
          size === 'default' && 'h-10 px-4 py-2',
          size === 'sm' && 'h-9 px-3',
          size === 'lg' && 'h-11 px-8',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };
`,
  UI_INPUT: `import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
            'text-sm placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, type InputProps };
`,
  UI_CARD: `import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props} />;
}

function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-2xl font-semibold leading-none', className)} {...props} />;
}

function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
`,
  UI_INDEX: `export { Button } from './button';
export { Input } from './input';
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';
`,
  UTILS: `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
`,
  CONSTANTS: `export const APP_NAME = 'My App';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
} as const;

export const QUERY_KEYS = {
  user: ['user'],
  products: ['products'],
} as const;
`,
  HOOK_DEBOUNCE: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
`,
  HOOK_LOCAL_STORAGE: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);
  return [storedValue, setStoredValue];
}
`,
  TYPES_INDEX: `export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
`,
  HEALTH_ROUTE: `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
`,
  AUTH_PAGE: `'use client';

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center">Authentication</h1>
      </div>
    </div>
  );
}
`,
  LAYOUT_HEADER: `import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <Link href="/" className="font-bold">Logo</Link>
        <nav className="ml-auto flex gap-4">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
        </nav>
      </div>
    </header>
  );
}
`,
  LAYOUT_FOOTER: `export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} My App. All rights reserved.</p>
      </div>
    </footer>
  );
}
`,
  LAYOUT_SIDEBAR: `interface SidebarProps { children?: React.ReactNode; }

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 border-r bg-background">
      <div className="p-4">{children}</div>
    </aside>
  );
}
`,
  REACT_APP: `import { Button } from './components/ui';

function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome</h1>
      <Button className="mt-6">Get Started</Button>
    </main>
  );
}

export default App;
`,
  REACT_MAIN: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
  EMPTY: '',
};

const TEMPLATES = {
  nextjs: {
    name: 'Next.js 14+ App Router',
    description: 'Modern Next.js with App Router, Server Components, and TypeScript',
    structure: {
      app: {
        'layout.tsx': 'ROOT_LAYOUT',
        'page.tsx': 'HOME_PAGE',
        'globals.css': 'GLOBALS_CSS',
        '(auth)': { login: { 'page.tsx': 'AUTH_PAGE' }, register: { 'page.tsx': 'AUTH_PAGE' } },
        api: { health: { 'route.ts': 'HEALTH_ROUTE' } },
      },
      components: {
        ui: { 'button.tsx': 'UI_BUTTON', 'input.tsx': 'UI_INPUT', 'card.tsx': 'UI_CARD', 'index.ts': 'UI_INDEX' },
        layout: { 'header.tsx': 'LAYOUT_HEADER', 'footer.tsx': 'LAYOUT_FOOTER', 'sidebar.tsx': 'LAYOUT_SIDEBAR' },
      },
      lib: { 'utils.ts': 'UTILS', 'constants.ts': 'CONSTANTS' },
      hooks: { 'use-debounce.ts': 'HOOK_DEBOUNCE', 'use-local-storage.ts': 'HOOK_LOCAL_STORAGE' },
      types: { 'index.ts': 'TYPES_INDEX' },
      public: { '.gitkeep': 'EMPTY' },
    },
    configFiles: ['next.config.js', 'tailwind.config.ts', 'tsconfig.json', 'postcss.config.js', '.eslintrc.json', '.prettierrc', '.gitignore', 'package.json'],
    deps: {
      dependencies: { next: '^14.0.0', react: '^18.2.0', 'react-dom': '^18.2.0', clsx: '^2.0.0', 'tailwind-merge': '^2.0.0' },
      devDependencies: { '@types/node': '^20.0.0', '@types/react': '^18.2.0', '@types/react-dom': '^18.2.0', autoprefixer: '^10.0.0', eslint: '^8.0.0', 'eslint-config-next': '^14.0.0', postcss: '^8.0.0', prettier: '^3.0.0', tailwindcss: '^3.4.0', typescript: '^5.0.0' },
    },
    scripts: { dev: 'next dev', build: 'next build', start: 'next start', lint: 'eslint . --ext .ts,.tsx', format: 'prettier --write .' },
  },
  react: {
    name: 'React + Vite',
    description: 'Modern React with Vite, TypeScript, and Tailwind CSS',
    structure: {
      src: {
        'App.tsx': 'REACT_APP',
        'main.tsx': 'REACT_MAIN',
        'index.css': 'GLOBALS_CSS',
        components: { ui: { 'button.tsx': 'UI_BUTTON', 'input.tsx': 'UI_INPUT', 'card.tsx': 'UI_CARD', 'index.ts': 'UI_INDEX' } },
        hooks: { 'use-debounce.ts': 'HOOK_DEBOUNCE', 'use-local-storage.ts': 'HOOK_LOCAL_STORAGE' },
        lib: { 'utils.ts': 'UTILS' },
        types: { 'index.ts': 'TYPES_INDEX' },
      },
      public: { '.gitkeep': 'EMPTY' },
    },
    configFiles: ['vite.config.ts', 'tailwind.config.ts', 'tsconfig.json', 'postcss.config.js', '.eslintrc.json', '.prettierrc', '.gitignore', 'package.json', 'index.html'],
    deps: {
      dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0', clsx: '^2.0.0', 'tailwind-merge': '^2.0.0' },
      devDependencies: { '@types/react': '^18.2.0', '@types/react-dom': '^18.2.0', '@vitejs/plugin-react': '^4.0.0', autoprefixer: '^10.0.0', eslint: '^8.0.0', postcss: '^8.0.0', prettier: '^3.0.0', tailwindcss: '^3.4.0', typescript: '^5.0.0', vite: '^5.0.0' },
    },
    scripts: { dev: 'vite', build: 'vite build', start: 'vite preview', lint: 'eslint . --ext .ts,.tsx', format: 'prettier --write .' },
  },
};

const FEATURES = {
  auth: { description: 'Authentication with session management', files: { 'lib/auth.ts': 'EMPTY', 'middleware.ts': 'EMPTY', 'components/auth/login-form.tsx': 'EMPTY', 'components/auth/register-form.tsx': 'EMPTY' }, dependencies: ['next-auth', '@auth/core'] },
  api: { description: 'API client with React Query', files: { 'lib/api-client.ts': 'EMPTY', 'lib/query-client.ts': 'EMPTY', 'providers/query-provider.tsx': 'EMPTY' }, dependencies: ['@tanstack/react-query', 'axios'] },
  forms: { description: 'Form handling with React Hook Form + Zod', files: { 'lib/form-utils.ts': 'EMPTY', 'components/forms/form-field.tsx': 'EMPTY' }, dependencies: ['react-hook-form', '@hookform/resolvers', 'zod'] },
  testing: { description: 'Testing setup with Vitest and Testing Library', files: { 'vitest.config.ts': 'EMPTY', 'src/test/setup.ts': 'EMPTY', 'src/test/utils.tsx': 'EMPTY' }, dependencies: ['vitest', '@testing-library/react', '@testing-library/jest-dom'] },
  storybook: { description: 'Component documentation with Storybook', files: { '.storybook/main.ts': 'EMPTY', '.storybook/preview.ts': 'EMPTY' }, dependencies: ['@storybook/react-vite', '@storybook/addon-essentials'] },
};

function getConfigContents(projectName, template, features) {
  const tmpl = TEMPLATES[template];
  const deps = JSON.parse(JSON.stringify(tmpl.deps));

  for (const feature of features) {
    for (const dep of FEATURES[feature]?.dependencies ?? []) {
      deps.dependencies[dep] = 'latest';
    }
  }

  const pkg = JSON.stringify({ name: projectName, version: '0.1.0', private: true, scripts: tmpl.scripts, dependencies: deps.dependencies, devDependencies: deps.devDependencies }, null, 2);
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  return {
    'package.json': pkg,
    'tsconfig.json': `{\n  "compilerOptions": {\n    "target": "ES2020",\n    "lib": ["dom","dom.iterable","esnext"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": true,\n    "noEmit": true,\n    "esModuleInterop": true,\n    "module": "esnext",\n    "moduleResolution": "bundler",\n    "resolveJsonModule": true,\n    "jsx": "preserve",\n    "paths": { "@/*": ["./*"] }\n  },\n  "include": ["**/*.ts","**/*.tsx"],\n  "exclude": ["node_modules"]\n}\n`,
    'tailwind.config.ts': `import type { Config } from 'tailwindcss';\nconst config: Config = {\n  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}','./src/**/*.{ts,tsx}'],\n  theme: { extend: {} },\n  plugins: [],\n};\nexport default config;\n`,
    'postcss.config.js': `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`,
    'next.config.js': `/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  images: { remotePatterns: [], formats: ['image/avif','image/webp'] },\n  experimental: { optimizePackageImports: ['lucide-react'] },\n};\nmodule.exports = nextConfig;\n`,
    'vite.config.ts': `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport path from 'path';\nexport default defineConfig({\n  plugins: [react()],\n  resolve: { alias: { '@': path.resolve(__dirname, './src') } },\n});\n`,
    '.eslintrc.json': `{"extends":["next/core-web-vitals","prettier"],"rules":{"react/no-unescaped-entities":"off"}}\n`,
    '.prettierrc': `{"semi":true,"singleQuote":true,"tabWidth":2,"trailingComma":"es5","printWidth":100}\n`,
    '.gitignore': `node_modules/\n.next/\nout/\ndist/\nbuild/\n.env\n.env.local\n.env.*.local\n.vscode/\n.idea/\n.DS_Store\ncoverage/\n`,
    'index.html': indexHtml,
  };
}

function generateStructure(basePath, structure, dryRun) {
  const files = [];
  for (const [name, value] of Object.entries(structure)) {
    const fullPath = join(basePath, name);
    if (typeof value === 'object') {
      if (!dryRun) mkdirSync(fullPath, { recursive: true });
      files.push(...generateStructure(fullPath, value, dryRun));
    } else {
      if (!dryRun) {
        mkdirSync(join(basePath), { recursive: true });
        writeFileSync(fullPath, FILE_CONTENTS[value] ?? '');
      }
      files.push(fullPath);
    }
  }
  return files;
}

function scaffoldProject({ name, outputDir, template = 'nextjs', features = [], dryRun = false }) {
  const tmpl = TEMPLATES[template];
  if (!tmpl) return { error: `Unknown template: ${template}` };

  const projectPath = join(outputDir, name);
  if (!dryRun && existsSync(projectPath)) return { error: `Directory already exists: ${projectPath}` };

  const files = [];
  if (!dryRun) mkdirSync(projectPath, { recursive: true });

  files.push(...generateStructure(projectPath, tmpl.structure, dryRun));

  const configContents = getConfigContents(name, template, features);
  for (const configFile of tmpl.configFiles) {
    if (configContents[configFile] !== undefined) {
      const filePath = join(projectPath, configFile);
      if (!dryRun) writeFileSync(filePath, configContents[configFile]);
      files.push(filePath);
    }
  }

  for (const feature of features) {
    const feat = FEATURES[feature];
    if (!feat) continue;
    for (const [relPath] of Object.entries(feat.files)) {
      const fullPath = join(projectPath, relPath);
      if (!dryRun) { mkdirSync(join(fullPath, '..'), { recursive: true }); writeFileSync(fullPath, ''); }
      files.push(fullPath);
    }
  }

  return {
    name,
    template,
    template_name: tmpl.name,
    features,
    path: projectPath,
    files_created: files.length,
    files,
    next_steps: [`cd ${name}`, 'npm install', 'npm run dev'],
  };
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    dir: { type: 'string', short: 'd', default: '.' },
    template: { type: 'string', short: 't', default: 'nextjs' },
    features: { type: 'string', short: 'f' },
    'list-templates': { type: 'boolean', default: false },
    'list-features': { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
  },
  allowPositionals: true,
});

if (values['list-templates']) {
  console.log('\nAvailable Templates:');
  for (const [key, tmpl] of Object.entries(TEMPLATES)) {
    console.log(`  ${key}: ${tmpl.name}`);
    console.log(`    ${tmpl.description}`);
  }
  process.exit(0);
}

if (values['list-features']) {
  console.log('\nAvailable Features:');
  for (const [key, feat] of Object.entries(FEATURES)) {
    console.log(`  ${key}: ${feat.description}`);
    if (feat.dependencies.length) console.log(`    Adds: ${feat.dependencies.join(', ')}`);
  }
  process.exit(0);
}

const name = positionals[0];
if (!name) { console.error('Usage: node frontend-scaffolder.js <project-name> [options]'); process.exit(1); }

const features = values.features ? values.features.split(',').map((f) => f.trim()) : [];
const invalid = features.filter((f) => !FEATURES[f]);
if (invalid.length) { console.error(`Unknown features: ${invalid.join(', ')}\nValid: ${Object.keys(FEATURES).join(', ')}`); process.exit(1); }

const result = scaffoldProject({ name, outputDir: resolve(values.dir), template: values.template, features, dryRun: values['dry-run'] });

if (result.error) { console.error(`Error: ${result.error}`); process.exit(1); }

if (values.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  if (values['dry-run']) {
    console.log(`\nDry run — would create ${result.files_created} files in ${result.path}`);
  } else {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Project Scaffolded: ${result.name}`);
    console.log('='.repeat(60));
    console.log(`Template: ${result.template_name}`);
    console.log(`Location: ${result.path}`);
    console.log(`Files Created: ${result.files_created}`);
    if (result.features.length) console.log(`Features: ${result.features.join(', ')}`);
    console.log('\nNext Steps:');
    for (const step of result.next_steps) console.log(`  $ ${step}`);
    console.log('='.repeat(60));
  }
}
