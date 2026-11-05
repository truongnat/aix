import { app, BrowserWindow, session, shell } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { registerIpcHandlers, isAllowedNavigationUrl, ensureKbServerRunning, shutdownKbServer } from './ipc-handlers.js';

const currentDir = dirname(fileURLToPath(import.meta.url));

// On Linux environments
if (process.platform === 'linux') {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('disable-dev-shm-usage');
  // Safe development / container fallback
  if (!app.isPackaged) {
    app.commandLine.appendSwitch('no-sandbox');
  }
}

// In packaged app: resourcesPath contains bundled resources (skills)
// In dev: repoRoot is 4 levels up
const isPackaged = app.isPackaged;
const repoRoot = isPackaged
  ? process.resourcesPath
  : join(currentDir, '..', '..', '..', '..');

// For user data (sessions, runtime memory, checkpoints):
// In dev: repoRoot
// In packaged app: app.getPath('userData')
const storageRoot = isPackaged
  ? app.getPath('userData')
  : repoRoot;

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    title: 'aix — AI Engineering Platform',
    backgroundColor: '#090a0f',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(currentDir, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });



  // Security: Deny window popups, open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const appHtmlPath = join(currentDir, '../renderer/index.html');

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isAllowedNavigationUrl(url, appHtmlPath, isPackaged)) return;
    event.preventDefault();
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        shell.openExternal(url);
      }
    } catch {
      // Invalid URL
    }
  });

  const devServerUrl = process.env['VITE_DEV_SERVER_URL'];
  if (devServerUrl && !isPackaged) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(join(currentDir, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Security: Strict Content-Security-Policy header
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://127.0.0.1:*;",
        ],
      },
    });
  });

  registerIpcHandlers({ repoRoot, storageRoot });
  createWindow();

  // Start KB Server automatically together with app on startup
  ensureKbServerRunning({ repoRoot, storageRoot })
    .then(res => console.log('[desktop]', res.message))
    .catch((err: unknown) => console.warn('[desktop] Failed to auto-start KB Server:', err));
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  shutdownKbServer({ storageRoot }).catch(() => {});
});
