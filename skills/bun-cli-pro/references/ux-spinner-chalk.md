# UX: Spinners, Colors, Output

Make your CLI pleasant to use with visual feedback, colors, and clear output formatting.

## ora spinners

The ora library provides elegant spinners with success/warning/error states:

```typescript
import ora from 'ora';

// Basic spinner
const spinner = ora('Loading data...').start();

await someAsyncTask();

spinner.succeed('Data loaded!');
spinner.warn('Data loaded but with warnings');
spinner.fail('Failed to load data');
spinner.info('Information message');
```

### Spinner states

```typescript
const spinner = ora('Pushing solution...').start();

// Change text
spinner.text = 'Validating...';
await validate();

spinner.text = 'Uploading...';
await upload();

// Success — leaves checkmark
spinner.succeed('Upload complete');

// Failure — shows X
spinner.fail('Upload failed');

// Stop without final state
spinner.stop();

// Warning — shows ⚠
spinner.warn('Upload succeeded but with issues');

// Info — shows ℹ
spinner.info('Upload skipped (already exists)');
```

### Spinner styling

```typescript
const spinner = ora({
  text: 'Processing...',
  prefixText: '✨',           // Custom prefix
  spinner: 'dots',             // Spinner style: dots, dots2, dots3, line, line2, pipe, simpleDots, etc.
  color: 'cyan',               // Color: cyan, magenta, yellow, blue, red, green, gray
  hideCursor: true,            // Hide cursor while spinning
}).start();

await task();

spinner.succeed({
  text: 'Done!',
  symbol: '✓',                 // Custom success symbol
});
```

## chalk colors

Color terminal output with chalk:

```typescript
import chalk from 'chalk';

// Basic colors
console.log(chalk.blue('Info message'));
console.log(chalk.green('Success!'));
console.log(chalk.yellow('Warning'));
console.log(chalk.red('Error'));

// Styles
console.log(chalk.bold('Bold text'));
console.log(chalk.italic('Italic'));
console.log(chalk.underline('Underlined'));
console.log(chalk.strikethrough('Strike through'));

// Combinations
console.log(chalk.bold.green('Success!'));
console.log(chalk.bgRed.white('Error background'));
console.log(chalk.blue.underline('Link-like text'));

// Hex colors
console.log(chalk.hex('#FF00FF')('Custom color'));
```

### CLI color conventions

```typescript
// Info
console.log(chalk.blue('ℹ'), 'Information:', message);

// Success
console.log(chalk.green('✓'), 'Success:', message);

// Warning
console.log(chalk.yellow('⚠'), 'Warning:', message);

// Error
console.log(chalk.red('✗'), 'Error:', message);

// Highlight
console.log('User:', chalk.bold(username));

// Dim (secondary info)
console.log(chalk.dim('Last updated: 2 hours ago'));
```

## Table output

Format data in a readable table:

```typescript
import Table from 'cli-table3';

const table = new Table({
  head: [chalk.bold('ID'), chalk.bold('Title'), chalk.bold('Tags')],
  style: {
    head: [],  // No color (default)
    border: ['cyan'],
    compact: false,
  },
});

solutions.forEach(sol => {
  table.push([
    chalk.dim(sol.id),
    chalk.bold(sol.title),
    sol.tags.join(', '),
  ]);
});

console.log(table.toString());
```

Output:
```
┌──────┬──────────────────────┬─────────────────────┐
│ ID   │ Title                │ Tags                │
├──────┼──────────────────────┼─────────────────────┤
│ sol1 │ Fix Neo4j Memory     │ neo4j, performance  │
│ sol2 │ Optimize Search      │ elasticsearch       │
└──────┴──────────────────────┴─────────────────────┘
```

## Progress bars

For long operations, show progress:

```typescript
import ProgressBar from 'cli-progress';

const bar = new ProgressBar.SingleBar({
  format: 'Progress [{bar}] {percentage}% | {value}/{total} items',
  barCompleteChar: '█',
  barIncompleteChar: '░',
  hideCursor: true,
});

bar.start(items.length, 0);

for (let i = 0; i < items.length; i++) {
  await processItem(items[i]);
  bar.increment();
}

bar.stop();
console.log(chalk.green('✓ Processing complete'));
```

## Prompts for user input

```typescript
import prompts from 'prompts';

const response = await prompts([
  {
    type: 'text',
    name: 'name',
    message: 'Project name:',
    initial: 'my-project',
    validate: (val) => val.length > 0 || 'Name cannot be empty',
  },
  {
    type: 'select',
    name: 'template',
    message: 'Choose template:',
    choices: [
      { title: 'Default', value: 'default' },
      { title: 'React', value: 'react' },
      { title: 'Vue', value: 'vue' },
    ],
  },
  {
    type: 'confirm',
    name: 'continue',
    message: 'Continue?',
    initial: true,
  },
]);

if (!response.continue) {
  process.exit(0);
}
```

## Combining spinner + output

```typescript
async function search(query: string) {
  const spinner = ora(`Searching for "${query}"...`).start();

  try {
    const results = await apiClient.search(query);
    spinner.stop();  // Stop spinner before output
    
    if (results.length === 0) {
      console.log(chalk.yellow('⚠ No results found'));
      return;
    }
    
    console.log(chalk.green(`✓ Found ${results.length} results
`));
    
    // Display results in table
    const table = new Table({
      head: [chalk.bold('Title'), chalk.bold('Tags')],
    });
    
    results.forEach(r => {
      table.push([r.title, r.tags.join(', ')]);
    });
    
    console.log(table.toString());
  } catch (error) {
    spinner.fail(`Search failed: ${(error as Error).message}`);
    process.exit(1);
  }
}
```

## JSON output flag

For scripting, provide `--json` flag:

```typescript
program
  .command('search')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const results = await search(query);
    
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      // Human-readable output (table, colors, spinners)
      displayResults(results);
    }
  });
```

## Error display

```typescript
function displayError(message: string, code?: string) {
  console.error('');
  console.error(chalk.bgRed.white(' ERROR '));
  console.error(chalk.red(`  ${message}`));
  if (code) {
    console.error(chalk.dim(`  Code: ${code}`));
  }
  console.error('');
}

// Usage
try {
  await someTask();
} catch (error) {
  displayError((error as Error).message, 'NETWORK_ERROR');
  process.exit(1);
}
```

## Suppressing output

```typescript
const QUIET = process.env.QUIET === 'true';

function log(message: string, color: (s: string) => string = chalk.reset) {
  if (!QUIET) {
    console.log(color(message));
  }
}

// Usage
log('Starting...');
log(chalk.green('Success!'));

// Run with QUIET=true myapp push
```
"