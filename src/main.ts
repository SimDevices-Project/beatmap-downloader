import { app, BrowserWindow, ipcMain, shell } from 'electron'
import * as platform from './Utils/platform'
import * as path from 'path'
import * as files from './Utils/files'
import { GLOBAL_CONFIG } from './global'

let mainWindow: Electron.BrowserWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'frontend.js'),
    },
    width: 800,
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../assets/windows/frame.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  ipcMain.on('download-file', (event, ...args) => {
    const { url, name }: { url: string; name: string } = args[0]
    const filePath = path.join(app.getPath('temp'), name)
    files
      .fetchFile(url)
      .then((data) => {
        return files.writeFile(filePath, data)
      })
      .then(() => {
        return shell.openExternal(filePath)
      })
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  if (platform.isWindows) {
    const argv = process.argv.slice()
    // 启动参数的数组的最后一项是唤醒链接
    console.log(decodeURI(argv.pop()))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('ready', () => {
  if (!app.isDefaultProtocolClient('osu')) {
    app.setAsDefaultProtocolClient('osu')
  }
})
// Mac 唤醒
app.on('open-url', (event, url) => {
  event.preventDefault()
  if (mainWindow) {
    mainWindow.webContents.send('external-link', decodeURI(url))
  } else {
    ipcMain.once('main-window-ready', (event, ...args) => {
      mainWindow.webContents.send('external-link', decodeURI(url))
    })
  }
})

// Windows 单一实例
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.log('gotTheLock')
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('second-instance-start')

    // 当运行第二个实例时
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        // 如果最小化
        //mainWindow.restore()
      }
      // 获得焦点
      // mainWindow.focus()
    } else {
      if (!platform.isWindows) {
        if (app.isReady()) createWindow()
      }
    }

    if (platform.isWindows) {
      console.log('second-instace')
      // commandLine 是一个数组， 其中最后一个数组元素为我们唤醒的链接
      const commands = commandLine.slice()
      if (mainWindow) {
        mainWindow.webContents.send('external-link', decodeURI(commands.pop()))
      } else {
        ipcMain.once('main-window-ready', (event, ...args) => {
          mainWindow.webContents.send('external-link', decodeURI(commands.pop()))
        })
      }
    }
  })
}

// 第一个启动的实例
if (mainWindow) {
  const commands = process.argv.slice()
  const lastArg = commands.pop()
  if (lastArg.startsWith(GLOBAL_CONFIG.Protocol)) {
    mainWindow.webContents.send('external-link', decodeURI(lastArg))
  }
} else {
  const commands = process.argv.slice()
  const lastArg = commands.pop()
  ipcMain.once('main-window-ready', (event, ...args) => {
    if (lastArg.startsWith(GLOBAL_CONFIG.Protocol)) {
      mainWindow.webContents.send('external-link', decodeURI(lastArg))
    }
  })
}
