const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  closeWindow: () => ipcRenderer.invoke('window:close'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),

  // File system
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  readDir: (dirPath) => ipcRenderer.invoke('fs:readDir', dirPath),
  readFileSlice: (filePath, start, end) => ipcRenderer.invoke('fs:readFileSlice', filePath, start, end),
  fileUrl: (filePath) => ipcRenderer.invoke('fs:fileUrl', filePath),

  // Config
  readConfig: () => ipcRenderer.invoke('config:read'),
  writeConfig: (data) => ipcRenderer.invoke('config:write', data),
  getConfigPath: () => ipcRenderer.invoke('app:getConfigPath'),

  // Check if we're in Electron
  isElectron: true,
});
