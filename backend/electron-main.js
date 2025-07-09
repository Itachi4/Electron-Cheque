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

  // 1. Define the production database path inside the user's AppData folder.
  const userDataPath = app.getPath('userData');
  const prodDbPath = path.join(userDataPath, 'prod.db');

  // 2. Define the source path of the database bundled with the installer.
  // In a packaged app, __dirname is ...\resources\app.asar
  // The extraResource is copied to ...\resources\
  const packagedDbPath = path.join(__dirname, '..', 'prisma', 'prod.db');

  // 3. On first launch, copy the pre-filled database to the user's AppData folder.
  if (isPackaged && !fs.existsSync(prodDbPath)) {
    console.log(`First launch: Copying database from ${packagedDbPath} to ${prodDbPath}`);
    try {
      fs.copyFileSync(packagedDbPath, prodDbPath);
      console.log('Database copied successfully.');
    } catch (error) {
      console.error('Failed to copy database:', error);
    }
  }

  // 4. Determine which database URL to use.
  const dbUrl = isPackaged
    ? `file:${prodDbPath}`
    : `file:${path.join(__dirname, 'prisma/dev.db')}`; // Use dev.db for local development

  const serverPath = path.join(__dirname, 'index.js');

  // 5. Start the Node.js server with the correct DATABASE_URL.
  console.log(`Starting server with DATABASE_URL: ${dbUrl}`);
  serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      DATABASE_URL: dbUrl
    }
  });

  serverProcess.stdout.on('data', (data) => console.log(`Node Server: ${data}`));
  serverProcess.stderr.on('data', (data) => console.error(`Node Server Error: ${data}`));
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