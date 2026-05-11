const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    minWidth: 900,
    minHeight: 580,
    frame: false,
    transparent: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'out', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─── IPC Handlers ────────────────────────────────────

// Window controls
ipcMain.handle('window:close', () => mainWindow?.close());
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

// Open folder dialog
ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

// Read directory contents
ipcMain.handle('fs:readDir', async (_, dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter(e => e.isFile())
      .map(e => ({
        name: e.name,
        path: path.join(dirPath, e.name),
      }));
  } catch (err) {
    return [];
  }
});

// Read file as buffer (for ID3 tags)
ipcMain.handle('fs:readFileSlice', async (_, filePath, start, end) => {
  try {
    const fd = fs.openSync(filePath, 'r');
    const size = Math.min(end - start, 524288); // Max 512KB
    const buffer = Buffer.alloc(size);
    fs.readSync(fd, buffer, 0, size, start);
    fs.closeSync(fd);
    return buffer;
  } catch {
    return null;
  }
});

// Get config path
ipcMain.handle('app:getConfigPath', () => {
  return path.join(app.getPath('userData'), 'config.json');
});

// Read config file
ipcMain.handle('config:read', async () => {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch {}
  return null;
});

// Write config file
ipcMain.handle('config:write', async (_, data) => {
  try {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
    return true;
  } catch {
    return false;
  }
});

// Convert file path to URL for audio playback
ipcMain.handle('fs:fileUrl', (_, filePath) => {
  return `file://${filePath.replace(/\\/g, '/')}`;
});
