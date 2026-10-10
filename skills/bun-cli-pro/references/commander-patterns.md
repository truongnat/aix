# Commander Patterns

Commander.js is the gold standard for CLI argument parsing in Node.js and Bun. It handles subcommands, options, arguments, help text, and validation elegantly.

## Basic structure

```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('myapp')
  .description('CLI tool description')
  .version('1.0.0');

// Define subcommands
program
  .command('push <file>')
  .description('Push a file')
  .action((file) => {
    console.log(`Pushing ${file}`);
  });

program
  .command('pull [remote]')
  .description('Pull changes')
  .argument('[remote]', 'Remote name', 'origin')
  .action((remote) => {
    console.log(`Pulling from ${remote}`);
  });

program.parse();
```

Key concepts:
- `.command('name')` defines a subcommand
- `<arg>` = required, `[arg]` = optional
- `.action()` is the handler function
- `.parse()` triggers argument parsing

## Options vs Arguments

```typescript
// Arguments — positional, order matters
program
  .command('create')
  .argument('<name>', 'Project name')
  .argument('[template]', 'Template name', 'default')
  .action((name, template) => { });

// Usage: myapp create myproject react

// Options — named flags, order doesn't matter
program
  .option('--verbose', 'Enable verbose output')
  .option('--config <path>', 'Config file path')
  .option('-d, --debug', 'Enable debug mode')
  .action((options) => { });

// Usage: myapp --verbose --config ./config.json
```

## Repeatable options

For flags that can be used multiple times:

```typescript
program
  .option('-t, --tag <tag>', 'Add a tag (repeatable)')
  .action((options) => {
    console.log(options.tag); // If used once: ['value']
                              // If used twice: ['value1', 'value2']
  });

// Usage: myapp --tag web --tag nodejs --tag api
```

To collect repeatable options:
```typescript
function collectTags(value, previous = []) {
  return [...previous, value];
}

program
  .option('-t, --tag <tag>', 'Add a tag', collectTags)
  .action((options) => {
    // options.tag = array of values
  });
```

## Global options (before subcommands)

```typescript
const program = new Command();

// Global options apply to all subcommands
program
  .option('--config <path>', 'Config file')
  .option('--verbose', 'Verbose output')
  .option('--json', 'JSON output');

program
  .command('push <file>')
  .action((file, options) => {
    // options.config, options.verbose, options.json available
  });

program
  .command('pull')
  .action((options) => {
    // Same global options available here
  });

// Usage: myapp --config /etc/config --verbose push myfile
```

## Subcommand nesting

For complex CLIs with multiple levels:

```typescript
const program = new Command('monorepo');

const git = program.command('git');
git.description('Git operations');

git
  .command('push [remote]')
  .action((remote = 'origin') => { });

git
  .command('pull [remote]')
  .action((remote = 'origin') => { });

const docker = program.command('docker');
docker.description('Docker operations');

docker
  .command('build <image>')
  .action((image) => { });

// Usage: monorepo git push origin
//        monorepo docker build myapp
```

## Type coercion

```typescript
program
  .option('--port <number>', 'Port number', parseInt)
  .option('--retries <number>', 'Retry count', (val) => Math.min(parseInt(val), 10))
  .option('--timeout <ms>', 'Timeout', parseFloat)
  .option('--enabled', 'Enable feature')
  .action((options) => {
    console.log(typeof options.port);     // 'number'
    console.log(typeof options.enabled);  // 'boolean'
  });
```

## Help text and examples

```typescript
program
  .command('push')
  .description('Push a solution to the KB')
  .argument('<file>', 'Path to solution file')
  .option('--force', 'Force overwrite if exists')
  .option('--tags <tags...>', 'Space-separated tags')
  .example('skill push ./solution.md --tags neo4j backend')
  .example('skill push ./bug-fix.md --force')
  .action((file, { force, tags }) => { });

// With .showHelpAfterError() — shows help on error
program.showHelpAfterError();

// Or per-command
program
  .command('search')
  .showHelpAfterError('(add --help for examples)')
  .action(() => { });
```

## Error handling and validation

```typescript
program
  .command('create <name>')
  .option('--template <name>', 'Template name')
  .action((name, options) => {
    // Validation
    if (!/^[a-z0-9-]+$/.test(name)) {
      console.error(`Error: Invalid project name "${name}"`);
      console.error('Use lowercase letters, numbers, and dashes only.');
      process.exit(1);
    }
    
    if (!fs.existsSync(options.template)) {
      console.error(`Error: Template not found: ${options.template}`);
      process.exit(1);
    }
  })
  .showHelpAfterError();
```

## Version and help

```typescript
program.version('1.2.3', '-v, --version', 'Display version');
program.helpOption('-h, --help', 'Display help');

// Custom help text
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ skill push ./solution.md');
  console.log('  $ skill search "neo4j" --tag backend');
});
```

## Common patterns

### Variadic arguments (zero or more)

```typescript
program
  .command('tag')
  .argument('<file>')
  .argument('[tags...]', 'Tags to add')
  .action((file, tags = []) => {
    console.log(`Tagging ${file} with: ${tags.join(', ')}`);
  });

// Usage: myapp tag myfile.md web nodejs
```

### Default values for options

```typescript
program
  .option('--port <number>', 'Port', '3000')  // String default
  .option('--timeout <ms>', 'Timeout', '5000')
  .action(({ port, timeout }) => {
    const portNum = parseInt(port);            // Convert when needed
    const timeoutNum = parseInt(timeout);
  });
```

### Conditionally required options

```typescript
program
  .command('deploy <env>')
  .option('--api-key <key>', 'API key for authentication')
  .action((env, options) => {
    if (env === 'production' && !options.apiKey) {
      console.error('Error: --api-key required for production deploy');
      process.exit(1);
    }
  });
```

### Hidden commands

```typescript
program
  .command('debug')
  .hideHelp()  // Not shown in --help
  .action(() => { });
```
"