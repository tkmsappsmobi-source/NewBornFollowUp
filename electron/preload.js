const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  readState: () => ipcRenderer.invoke('read-state'),
  writeState: (state) => ipcRenderer.invoke('write-state', state),
  getStateFilePath: () => ipcRenderer.invoke('get-state-file-path'),
})
