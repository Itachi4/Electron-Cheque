// backend/electron-main.js

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;
let serverStarted = false;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

function startServer() {
  let backendPath;
  let nodeExec;
  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, 'backend', 'index.js');
    nodeExec = process.execPath;
    console.log('Production mode: Spawning backend with:', nodeExec, backendPath);
    serverProcess = spawn(nodeExec, ['--no-sandbox', backendPath]);
  } else {
    backendPath = path.join(__dirname, 'index.js');
    nodeExec = 'node';
    console.log('Development mode: Spawning backend with:', nodeExec, backendPath);
    serverProcess = spawn(nodeExec, [backendPath]);
  }
  console.log('Spawn command:', nodeExec, backendPath);
  serverProcess.stdout.on('data', (data) => console.log(`Node Server: ${data}`));
  serverProcess.stderr.on('data', (data) => console.error(`Node Server Error: ${data}`));
  serverProcess.on('close', (code) => console.log(`Node server process exited with code ${code}`));
  serverProcess.on('error', (err) => console.error('Failed to start backend process:', err));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      // This setting is critical for debugging the blank screen
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Always load the production Angular build
  const filePath = path.join(__dirname, 'dist-frontend/browser/index.html');
  console.log(`[Production] Attempting to load file: ${filePath}`);
  mainWindow.loadFile(filePath)
    .then(() => console.log('Main window loaded successfully.'))
    .catch(err => console.error('Failed to load file:', err));
  mainWindow.webContents.openDevTools();
}

// The rest of the file remains the same...
app.whenReady().then(() => {
  if (!serverStarted) {
    startServer();
    serverStarted = true;
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) serverProcess.kill();
    app.quit();
  }
});