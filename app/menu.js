const { Menu, BrowserWindow } = require('electron');
const path = require('path');
const electronLog = require('electron-log');

module.exports = (mainWindow, app, store) => {

  // Globally export what OS we are on
  //const isLinux = process.platform === 'linux';
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  // Enable remote module on sub-windows
  require('@electron/remote/main').enable(mainWindow.webContents);

  return Menu.buildFromTemplate([
  {
    role: 'fileMenu',
    label: 'Slacktron',
    submenu: [
      {
        label: 'Go Back',
        accelerator: 'Alt+Left',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.goBack();
          electronLog.info('Navigated back');
        }
      },
      {
        label: 'Go Forward',
        accelerator: 'Alt+Right',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.goForward();
          electronLog.info('Navigated forward');
        }
      },
      {
        label: 'Close Window',
        accelerator: 'CmdorCtrl+W',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.close();
          electronLog.info('Closed a window');
        }
      },
      { type: 'separator' },
      {
        label: 'Create Popout Window',
        click() {
          app.emit('popout-window');
          electronLog.info('Created Popout Window');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'
      }
    ]
  },
  {
    role: 'editMenu',
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' },
      { type: 'separator' },
      {
        label: 'Find',
        accelerator: 'CmdorCtrl+F',
        click(item, focusedWindow) {
          if (focusedWindow) {
            electronLog.warn('Find not implemented yet!');
          }
        }
      }
    ]
  },
  {
    role: 'viewMenu',
    label: 'View',
    submenu: [
      { role: 'reload' },
      {
        label: 'Reload F5',
        accelerator: 'F5',
        visible: false,
        acceleratorWorksWhenHidden: true,
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.reload();
        }
      },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'windowMenu',
    label: 'Window',
    submenu: [
      {
        label: "Always Show MenuBar",
        type: 'checkbox',
        click() {
          if (store.get('options.autoHideMenuBar')) {
            store.set('options.autoHideMenuBar', false);
          } else {
            store.set('options.autoHideMenuBar', true);
          }
          app.emit('toggle-menubar');
        },
        checked: !store.get('options.autoHideMenuBar')
      },
      { type: 'separator' },
      { role: 'minimize' },
      { role: 'zoom' }
    ]
  },
  {
    label: 'Developer',
    submenu: [
      {
        label: 'Open Electron DevTools',
        accelerator: isMac ? 'CmdorCtrl+Shift+F12' : 'F12',
        click(item, focusedWindow) {
          focusedWindow.openDevTools({ mode: 'detach' });
        }
      },
      { type: 'separator' },
      {
        label: 'Open chrome://gpu',
        accelerator: 'CmdorCtrl+Alt+G',
        click() {
          const gpuWindow = new BrowserWindow({ width: 900, height: 700, useContentSize: true, title: 'GPU Internals' });
          gpuWindow.loadURL('chrome://gpu');
          electronLog.info('Opened chrome://gpu');
        }
      },
      {
        label: 'Open chrome://process-internals',
        accelerator: 'CmdorCtrl+Alt+P',
        click() {
          const procsWindow = new BrowserWindow({ width: 900, height: 700, useContentSize: true, title: 'Process Model Internals' });
          procsWindow.loadURL('chrome://process-internals');
          electronLog.info('Opened chrome://process-internals');
        }
      },
      {
        label: 'Open chrome://media-internals',
        accelerator: 'CmdorCtrl+Alt+M',
        click() {
          const mediaWindow = new BrowserWindow({ width: 900, height: 700, useContentSize: true, title: 'Media Internals' });
          mediaWindow.loadURL('chrome://media-internals');
          electronLog.info('Opened chrome://media-internals');
        }
      },
      {
        label: 'Open chrome://histograms',
        visible: process.env.QUARK_TEST === '1',
        click() {
          const histogramWindow = new BrowserWindow({ width: 900, height: 700, useContentSize: true, title: 'Histogram Internals' });
          histogramWindow.loadURL('chrome://histograms');
          electronLog.info('Opened chrome://histograms');
        }
      },
      { type: 'separator' },
      {
        label: 'Relaunch App',
        click() {
          electronLog.warn('Restarting App...');
          app.relaunch();
          app.quit();
        }
      }
    ]
  },
  {
    role: 'help',
    label: 'About',
    submenu: [
      { label: 'Slacktron v' + app.getVersion(), enabled: false },
      {
        label: 'Created by Alex313031',
        click() {
          new BrowserWindow({ width: 1024, height: 768, useContentSize: true }).loadURL('https://github.com/Alex313031/slack-electron#readme');
        }
      },
      { type: 'separator' },
      {
        label: 'View Humans.txt',
        accelerator: 'CmdorCtrl+Alt+Shift+H',
        click() {
          const humansWindow = new BrowserWindow({
            width: 400,
            height: 450,
            useContentSize: true,
            autoHideMenuBar: true,
            title: 'humans.txt',
            darkTheme: true
          });
          humansWindow.loadFile('./humans.txt');
          electronLog.info('Opened humans.txt :)');
        }
      },
      {
        label: 'View License',
        accelerator: 'CmdorCtrl+Alt+Shift+L',
        click() {
          const licenseWindow = new BrowserWindow({
            width: 532,
            height: 632,
            useContentSize: true,
            autoHideMenuBar: true,
            title: 'License',
            darkTheme: true
          });
          licenseWindow.loadFile('./license.md');
          electronLog.info('Opened license.md');
        }
      },
      {
        label: 'About App',
        accelerator: 'CmdorCtrl+Alt+A',
        click() {
          const aboutWindow = new BrowserWindow({
            width: 390,
            height: 318,
            useContentSize: true,
            autoHideMenuBar: true,
            skipTaskbar: true,
            title: 'About App',
            icon: isWin ? path.join(__dirname, 'icon.ico') : path.join(__dirname, 'icon64.png'),
            darkTheme: true,
            webPreferences: {
              nodeIntegration: false,
              nodeIntegrationInWorker: false,
              contextIsolation: false,
              sandbox: false,
              experimentalFeatures: true,
              webviewTag: true,
              devTools: true,
              preload: path.join(__dirname, 'preload.js')
            }
          });
          require('@electron/remote/main').enable(aboutWindow.webContents);
          aboutWindow.loadFile('./about.html');
          electronLog.info('Opened about.html');
        }
      }
    ]
  }
  ]);
};
