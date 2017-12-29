const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const {ipcMain} = require('electron')

let child
let canquit = true

ipcMain.on('set-child', (event, arg) => {
  child = arg
  if (child != null) {
    canquit = false
    if (process.platform === 'darwin') {
      command = 'networksetup -setsocksfirewallproxy Wi-Fi localhost 1080 && networksetup -setsocksfirewallproxystate Wi-Fi on'
      var exec = require('child_process').exec, sp;
      sp = exec(command, function (error, stdout, stderr) { });
    }
  } else {
    canquit = true
    if (process.platform === 'darwin') {
      command = 'networksetup -setsocksfirewallproxystate Wi-Fi off'
      var exec = require('child_process').exec, sp;
      sp = exec(command, function (error, stdout, stderr) { });
    }
  }
})

ipcMain.on('get-path', (event) => {
  approot = getAppRoot()
  event.returnValue = approot;
})

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 600, height: 350})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close', function (e) {
    if (!canquit) {
      e.preventDefault();
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    if (process.platform === 'darwin') {
      command = 'networksetup -setsocksfirewallproxystate Wi-Fi off'
      var exec = require('child_process').exec, sp;
      sp = exec(command, function (error, stdout, stderr) { });
    }
  })

  // Create the Application's main menu
  var template = [{
      label: "Application",
      submenu: [
          { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
          { type: "separator" },
          { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
      ]}, {
      label: "Edit",
      submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]}
  ];

  electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(template));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('quit', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (child != null) {
    process.kill(child.pid)
  }
})

function getAppRoot() {
  if ( process.platform === 'win32' ) {
    // return __dirname
    return process.env.PORTABLE_EXECUTABLE_DIR;
  }  else if (process.platform === 'darwin') {
    return __dirname
  }
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
