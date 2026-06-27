# Config Management

## Conf library

The Conf library (`npm install conf`) provides zero-config file-based configuration storage in the OS standard location (`~/.config/myapp/` on Linux/macOS, `%APPDATA%` on Windows).

```typescript
import Conf from 'conf';

const config = new Conf();

// Write
config.set('apiKey', 'sk_live_123456');
config.set('workspace', { name: 'default', id: 'ws_123' });

// Read
const apiKey = config.get('apiKey');
const workspace = config.get('workspace');

// Delete
config.delete('apiKey');

// Clear all
config.clear();
```

Default location:
- **Linux**: `~/.config/myapp/config.json`
- **macOS**: `~/Library/Application Support/myapp/config.json`
- **Windows**: `%APPDATA%/myapp/config.json`

## Schema validation

Validate config structure with Zod or Joi:

```typescript
import Conf from 'conf';
import { z } from 'zod';

const configSchema = z.object({
  apiKey: z.string().min(10),
  apiUrl: z.string().url(),
  workspace: z.object({
    name: z.string(),
    id: z.string(),
  }),
  maxRetries: z.number().int().min(0).max(10),
  debug: z.boolean().default(false),
});

const config = new Conf({
  schema: configSchema.parse,
  defaults: {
    debug: false,
    maxRetries: 3,
  },
});

// Accessing with type safety
config.set('apiKey', 'sk_live_123');
config.set('maxRetries', 5);

// This will throw if validation fails
config.set('maxRetries', 'invalid');
```

## Defaults and migrations

```typescript
const config = new Conf({
  projectName: 'myapp',
  defaults: {
    apiUrl: 'https://api.example.com',
    workspace: 'default',
    cacheEnabled: true,
    maxRetries: 3,
  },
  // Run when config is created for the first time
  serialize: (value) => JSON.stringify(value, null, 2),
  deserialize: (text) => JSON.parse(text),
});

// Migrate from old config format
if (config.has('apiToken') && !config.has('apiKey')) {
  config.set('apiKey', config.get('apiToken'));
  config.delete('apiToken');
}
```

## API token management

```typescript
interface Config {
  apiKey: string;
  apiUrl: string;
  user?: { id: string; email: string };
}

class ConfigManager {
  private config: Conf<Config>;

  constructor() {
    this.config = new Conf<Config>({
      defaults: {
        apiUrl: 'https://api.example.com',
      },
    });
  }

  setToken(token: string) {
    this.config.set('apiKey', token);
  }

  getToken(): string | undefined {
    return this.config.get('apiKey');
  }

  hasToken(): boolean {
    return this.config.has('apiKey');
  }

  clearToken() {
    this.config.delete('apiKey');
  }

  setUser(user: { id: string; email: string }) {
    this.config.set('user', user);
  }

  getUser() {
    return this.config.get('user');
  }
}

export const configManager = new ConfigManager();
```

## --config flag for custom path

```typescript
import { Command } from 'commander';
import path from 'path';
import Conf from 'conf';

const program = new Command();

let config: Conf;

program
  .option('--config <path>', 'Config file path', '~/.config/myapp/config.json')
  .hook('preAction', (thisCommand) => {
    const configPath = thisCommand.opts().config.replace('~', os.homedir());
    config = new Conf({
      configName: path.basename(configPath),
      cwd: path.dirname(configPath),
    });
  });

program
  .command('login <token>')
  .action((token) => {
    config.set('apiKey', token);
    console.log(`Token saved to ${config.path}`);
  });

program.parse();
```

Usage: `myapp --config /tmp/custom.json login sk_live_123`

## User prompts for first-time setup

```typescript
import prompts from 'prompts';
import Conf from 'conf';

const config = new Conf();

async function ensureConfigured() {
  if (!config.has('apiKey')) {
    console.log('First-time setup required.
');
    
    const response = await prompts([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your API key:',
        validate: (value) => value.length >= 10 || 'Key must be at least 10 chars',
      },
      {
        type: 'text',
        name: 'workspace',
        message: 'Default workspace:',
        initial: 'default',
      },
    ]);
    
    config.set('apiKey', response.apiKey);
    config.set('workspace', response.workspace);
    console.log('Config saved!
');
  }
}

await ensureConfigured();
```

## Config file format

Conf stores config as JSON. It's human-editable:

```json
// ~/.config/myapp/config.json
{
  "apiKey": "sk_live_abc123xyz",
  "apiUrl": "https://api.example.com",
  "workspace": "production",
  "maxRetries": 5,
  "user": {
    "id": "user_123",
    "email": "dev@example.com"
  }
}
```

Users can edit this file directly. It's recommended to add a comment in your `--help` about config location:

```typescript
program.on('--help', () => {
  console.log('');
  console.log(`Config file: ${config.path}`);
  console.log('You can edit this file manually.');
});
```

## Env variable override

For CI/CD and deploy environments, allow env vars to override config:

```typescript
function getApiKey(): string {
  // 1. Check env var (highest priority)
  if (process.env.API_KEY) {
    return process.env.API_KEY;
  }
  
  // 2. Check config file
  if (config.has('apiKey')) {
    return config.get('apiKey');
  }
  
  // 3. Error if neither
  throw new Error('API key not configured. Set API_KEY env var or use: myapp login <token>');
}
```

Usage in CI:
```bash
export API_KEY=sk_ci_secret
myapp deploy  # Uses env var, not local config
```

## Workspace switching

```typescript
class ConfigManager {
  private baseDir = path.join(os.homedir(), '.config/myapp');

  getConfigForWorkspace(workspace: string): Conf {
    const configFile = path.join(this.baseDir, `${workspace}.json`);
    return new Conf({
      configName: `${workspace}`,
      cwd: this.baseDir,
    });
  }

  switchWorkspace(workspace: string) {
    this.config.set('currentWorkspace', workspace);
    console.log(`Switched to workspace: ${workspace}`);
  }
}

// Usage: myapp --workspace production deploy
```

## Clearing sensitive data

```typescript
program
  .command('logout')
  .description('Clear all stored credentials')
  .action(() => {
    config.delete('apiKey');
    config.delete('user');
    console.log('Logged out. Run "myapp login" to authenticate again.');
  });

program
  .command('config:reset')
  .description('Reset all configuration to defaults')
  .action(() => {
    config.clear();
    console.log(`Config cleared from ${config.path}`);
  });
```
"