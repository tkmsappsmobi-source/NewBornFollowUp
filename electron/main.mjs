import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(os.homedir(), '.newbornfollowup')
const STATE_FILE = path.join(DATA_DIR, 'state.json')

let mainWindow

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  ensureDataDir()

  const isDev = process.env.VITE_DEV_SERVER_URL
  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC handlers
ipcMain.handle('read-state', async () => {
  ensureDataDir()
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error('Error reading state:', error)
    return null
  }
})

ipcMain.handle('write-state', async (event, state) => {
  ensureDataDir()
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error writing state:', error)
    return false
  }
})

ipcMain.handle('get-state-file-path', async () => {
  return STATE_FILE
})
