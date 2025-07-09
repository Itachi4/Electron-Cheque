const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, 'dist-frontend/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  }
}

function startServer() {
  const isPackaged = app.isPackaged;

  // Path to copy the DB to
  const userDataPath = app.getPath('userData');
  const prodDbPath = path.join(userDataPath, 'prod.db');

  // Path to bundled DB in installer
  const packagedDbPath = path.join(__dirname, '..', 'backend', 'prisma', 'prod.db');

  // Copy prod.db from bundled path to user path (first launch only)
  if (isPackaged && !fs.existsSync(prodDbPath)) {
    try {
      console.log(`📦 Copying prod.db to: ${prodDbPath}`);
      fs.copyFileSync(packagedDbPath, prodDbPath);
    } catch (error) {
      console.error('❌ Failed to copy prod.db:', error);
    }
  }

  const dbUrl = isPackaged
    ? `file:${prodDbPath}`
    : `file:${path.join(__dirname, 'backend/prisma/prod.db')}`;

  console.log('🚀 Starting backend with DATABASE_URL:', dbUrl);

  const serverPath = path.join(__dirname, 'backend/index.js');
  serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
    },
    cwd: path.join(__dirname, 'backend'), // Optional: ensures file paths resolve correctly
  });

  serverProcess.stdout.on('data', (data) => console.log(`📤 Server: ${data.toString().trim()}`));
  serverProcess.stderr.on('data', (data) => console.error(`❌ Server Error: ${data.toString().trim()}`));
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) serverProcess.kill();
    app.quit();
  }
});
