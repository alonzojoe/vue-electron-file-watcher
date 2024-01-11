import { app, shell, BrowserWindow, contextBridge, ipcMain } from 'electron'
import { join, basename } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import chokidar from 'chokidar'
import fs from 'fs'
import moment from 'moment/moment'
import path from 'path'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.webContents.openDevTools()
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// function startFileWatcher() {
//   const ordersFolder = 'D:\\ORDERS'
//   const targetFolder = 'D:\\O_DESTINATION'

//   const watcher = chokidar.watch(ordersFolder, {
//     ignored: /^\./,
//     persistent: true
//   })

//   console.log(`Watching for changes in ${ordersFolder}`)

//   watcher.on('add', (filePath) => {
//     const fileName = basename(filePath)
//     const destinationPath = join(targetFolder, fileName)

//     fs.rename(filePath, destinationPath, (err) => {
//       if (err) throw err
//       console.log(`Moved ${fileName} to ${targetFolder}`)
//     })
//   })

//   watcher.on('error', (error) => {
//     console.error(`Error watching files: ${error}`)
//   })
// }
function startFileWatcher() {
  const ordersFolder = 'D:\\ORDERS'
  const targetFolder = 'D:\\O_DESTINATION'

  const watcher = chokidar.watch(ordersFolder, {
    ignored: /^\./,
    persistent: true
  })

  console.log(`Watching for changes in ${ordersFolder}`)

  watcher.on('add', (filePath) => {
    const fileExtension = path.extname(filePath).toLowerCase()
    if (fileExtension === '.pdf') {
      const fileName = basename(filePath)
      const fileDate = moment()

      const year = fileDate.format('YYYY')
      const month = fileDate.format('MM')
      const day = fileDate.format('DD')

      const destinationYearPath = join(targetFolder, year)
      const destinationMonthPath = join(destinationYearPath, month)
      const destinationDayPath = join(destinationMonthPath, day)

      const destinationPath = join(destinationDayPath, fileName)

      // Create directories if they don't exist
      if (!fs.existsSync(destinationYearPath)) {
        fs.mkdirSync(destinationYearPath)
      }
      if (!fs.existsSync(destinationMonthPath)) {
        fs.mkdirSync(destinationMonthPath)
      }
      if (!fs.existsSync(destinationDayPath)) {
        fs.mkdirSync(destinationDayPath)
      }

      fs.rename(filePath, destinationPath, (err) => {
        if (err) throw err
        console.log(`Moved ${fileName} to ${destinationPath}`)
      })
      // Retry moving the file with a delay (e.g., 500ms)
      const maxRetries = 3
      let retries = 0

      const tryMoveFile = () => {
        fs.rename(filePath, destinationPath, (err) => {
          if (err) {
            if (err.code === 'EBUSY' && retries < maxRetries) {
              console.log(`Retrying (${retries + 1}/${maxRetries})...`)
              retries++
              setTimeout(tryMoveFile, 5000) // Retry after a delay
            } else {
              console.error(`Error moving ${fileName}: ${err.message}`)
            }
          } else {
            console.log(`Moved ${fileName} to ${destinationPath}`)
          }
        })
      }

      tryMoveFile()
    }
  })

  watcher.on('error', (error) => {
    console.error(`Error watching files: ${error}`)
  })
}

ipcMain.handle('startFileWatcher', () => {
  startFileWatcher()
})
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
module.exports = {
  startFileWatcher // Export this function for access in the renderer process
}
