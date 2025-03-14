const { app, BrowserWindow, Menu, nativeTheme } = require('electron');
const electronLog = require('electron-log');
const contextMenu = require('electron-context-menu');
const Store = require('electron-store');
const path = require('path');
const url = require('url');
const menu = require('./menu.js');
const store = new Store();

// Initialize Electron remote module
require('@electron/remote/main').initialize();

// Restrict main.log size to 100Kb
electronLog.transports.file.maxSize = 1024 * 100;

// Get app details from package.json
const appName = app.getName();
const appVersion = app.getVersion();
// Export Electron versions
const electronVer = process.versions.electron;
const chromeVer = process.versions.chrome;
const nodeVer = process.versions.node;
const v8Ver = process.versions.v8;

// Globally export what OS we are on
//const isLinux = process.platform === 'linux';
const isWin = process.platform === 'win32';
//const isMac = process.platform === 'darwin';

let mainWindow;
async function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Slacktron',
    resizable: true,
    maximizable: true,
    minWidth: 400,
    minHeight: 300,
    width: 1024,
    height: 800,
    useContentSize: true,
    icon: isWin ? path.join(__dirname, 'icon.ico') : path.join(__dirname, 'icon64.png'),
    darkTheme: true,
    autoHideMenuBar: store.get('options.autoHideMenuBar') ? true : false,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: false,
      sandbox: false,
      experimentalFeatures: true,
      webviewTag: true,
      devTools: true,
      // Preload before renderer processes
      preload: path.join(__dirname, 'preload.js')
    }
  });
  require('@electron/remote/main').enable(mainWindow.webContents);
  Menu.setApplicationMenu(menu(mainWindow, app, store));

  nativeTheme.themeSource = 'dark';

  const windowDetails = store.get('options.windowDetails');
  if (windowDetails) {
    mainWindow.setSize(
      windowDetails.size[0],
      windowDetails.size[1]
    );
    mainWindow.setPosition(
      windowDetails.position[0],
      windowDetails.position[1]
    );
  }

  // Load the index.html of the app.
  mainWindow.webContents.userAgent = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.243 Safari/537.36"
  mainWindow.loadURL("https://app.slack.com/client");

  // Emitted when the window is closing
  mainWindow.on('close', () => {
    // If enabled store the window details so they can be restored upon restart
    if (mainWindow) {
      store.set('options.windowDetails', {
        position: mainWindow.getPosition(),
        size: mainWindow.getSize()
      });
      electronLog.info('Saved windowDetails');
    } else {
      electronLog.error('Error: Window was not defined while trying to save windowDetails.');
      return;
    }
    electronLog.info('mainWindow.close()');
  });
}

app.on('toggle-menubar', () => {
  if (store.get('options.autoHideMenuBar')) {
    mainWindow.autoHideMenuBar = true;
    mainWindow.menuBarVisible = false;
  } else {
    mainWindow.autoHideMenuBar = false;
    mainWindow.menuBarVisible = true;
  }
  electronLog.info('Note: Changed menu visibility setting');
});

// function createVideoWindow() {
  // const popoutWindow = new BrowserWindow({
    // width: 500,
    // height: 900,
    // useContentSize: true
  // });
  // popoutWindow.loadURL(url.format({
    // pathname: path.join(__dirname, 'videos', 'video.html'),
    // protocol: 'file:',
    // slashes: true
  // }));
// }

async function createPopOutWindow() {
  const popoutWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: undefined,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: false,
      sandbox: true,
      experimentalFeatures: true,
      webviewTag: true,
      devTools: true
    }
  });
  popoutWindow.loadURL('https://www.google.com/');
}

app.on('popout-window', () => {
  createPopOutWindow();
});

contextMenu({
  showSelectAll: false,
  showCopyImage: true,
  showCopyImageAddress: true,
  showSaveImageAs: true,
  showCopyVideoAddress: true,
  showSaveVideoAs: true,
  showCopyLink: true,
  showSaveLinkAs: true,
  showInspectElement: true,
  showLookUpSelection: true,
  showSearchWithGoogle: true,
  prepend: (defaultActions, parameters) => [
  {
    label: 'Open Link in New Window',
    // Only show it when right-clicking a link
    visible: parameters.linkURL.trim().length > 0,
    click: () => {
      const toURL = parameters.linkURL;
      const linkWin = new BrowserWindow({
        title: 'New Window',
        width: 1024,
        height: 700,
        useContentSize: true,
        darkTheme: true,
        webPreferences: {
          nodeIntegration: false,
          nodeIntegrationInWorker: false,
          experimentalFeatures: true,
          devTools: true
        }
      });
      linkWin.loadURL(toURL);
      electronLog.info('Opened Link in New Window');
    }
  },
  {
    label: 'Open Image in New Window',
    // Only show it when right-clicking an image
    visible: parameters.mediaType === 'image',
    click: () => {
      const imgURL = parameters.srcURL;
      const imgTitle = imgURL.substring(imgURL.lastIndexOf('/') + 1);
      const imgWin = new BrowserWindow({
        title: imgTitle,
        useContentSize: true,
        darkTheme: true,
        webPreferences: {
          nodeIntegration: false,
          nodeIntegrationInWorker: false,
          experimentalFeatures: true,
          devTools: true
        }
      });
      imgWin.loadURL(imgURL);
      electronLog.info('Opened Image in New Window');
    }
  },
  {
    label: 'Open Video in New Window',
    // Only show it when right-clicking text
    visible: parameters.mediaType === 'video',
    click: () => {
      const vidURL = parameters.srcURL;
      let vidTitle;
      vidTitle = vidURL.substring(vidURL.lastIndexOf('/') + 1);
      const vidWin = new BrowserWindow({
        title: vidTitle,
        useContentSize: true,
        darkTheme: true,
        webPreferences: {
          nodeIntegration: false,
          nodeIntegrationInWorker: false,
          experimentalFeatures: true,
          devTools: true
        }
      });
      vidWin.loadURL(vidURL);
      electronLog.info('Popped out Video');
    }
  }]
});

app.commandLine.appendSwitch('enable-local-file-accesses');
app.commandLine.appendSwitch('enable-quic');
app.commandLine.appendSwitch('enable-ui-devtools');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-features', 'CSSColorSchemeUARendering,ImpulseScrollAnimations,ParallelDownloading,Portals,StorageBuckets,JXL');

function initLog() {
  electronLog.info('Welcome to ' + appName + ' v' + appVersion);
  electronLog.info('Electron Version: ' + [ electronVer ]);
  electronLog.info('Chromium Version: ' + [ chromeVer ]);
  electronLog.info('NodeJS Version: ' + [ nodeVer ]);
  electronLog.info('V8 Version: ' + [ v8Ver ]);
}

app.whenReady().then(createWindow);

app.on('ready', () => {
  initLog();
});
