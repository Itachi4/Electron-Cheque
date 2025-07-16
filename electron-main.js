// backend/electron-main.js

const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const which = require('which');

let mainWindow;
let serverProcess;
let serverStarted = false;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

const logFile = path.join(app.getPath('userData'), 'backend-log.txt');
function logToFile(message) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
  } catch (e) {
    console.error('Failed to write to log file:', e);
  }
}

function startServer() {
  let backendPath;
  let nodeExec;
  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, 'backend', 'index.js');
    nodeExec = path.join(process.resourcesPath, 'node-win', 'node.exe');
    logToFile(`Production mode: Spawning backend with: ${nodeExec} ${backendPath}`);
    serverProcess = spawn(nodeExec, [backendPath], {
      cwd: path.join(process.resourcesPath, 'backend'),
      env: process.env
    });
  } else {
    backendPath = path.join(__dirname, 'backend', 'index.js');
    nodeExec = 'node';
    logToFile(`Development mode: Spawning backend with: ${nodeExec} ${backendPath}`);
    serverProcess = spawn(nodeExec, [backendPath]);
  }
  logToFile(`Spawn command: ${nodeExec} ${backendPath}`);

  serverProcess.stdout.on('data', (data) => {
    const msg = `Node Server: ${data}`;
    console.log(msg);
    logToFile(msg);
    // Show dialog only on first successful start
    // if (data.toString().includes('BACKEND STARTED')) {
    //   dialog.showMessageBox({
    //     type: 'info',
    //     title: 'Backend Started',
    //     message: 'Backend started successfully!'
    //   });
    // }
  });
  serverProcess.stderr.on('data', (data) => {
    const msg = `Node Server Error: ${data}`;
    console.error(msg);
    logToFile(msg);
    dialog.showErrorBox('Backend Error', data.toString());
  });
  serverProcess.on('close', (code) => {
    const msg = `Node server process exited with code ${code}`;
    console.log(msg);
    logToFile(msg);
    // dialog.showErrorBox('Backend Closed', `Backend exited with code ${code}`);
  });
  serverProcess.on('error', (err) => {
    const msg = `Failed to start backend process: ${err}`;
    console.error(msg);
    logToFile(msg);
    dialog.showErrorBox('Backend Failed to Start', err.toString());
  });
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
  // const filePath = path.join(__dirname, 'dist-frontend/browser/index.html');
  let filePath;
  if (app.isPackaged) {
    filePath = path.join(process.resourcesPath, 'backend', 'dist-frontend', 'browser', 'index.html');
  } else {
    filePath = path.join(__dirname, 'backend', 'dist-frontend', 'browser', 'index.html');
  }
  console.log(`[Production] Attempting to load file: ${filePath}`);
  mainWindow.loadFile(filePath)
    .then(() => console.log('Main window loaded successfully.'))
    .catch(err => console.error('Failed to load file:', err));
  //mainWindow.webContents.openDevTools();
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