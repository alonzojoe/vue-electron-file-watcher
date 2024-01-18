import { app, shell, BrowserWindow, contextBridge, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { extractRenderDetailID, updatePath, finalizeDocPath } from './service'
import { join, basename } from 'path'
import chokidar from 'chokidar'
import fs from 'fs'
import fsExtra from 'fs-extra'
import moment from 'moment/moment'
import path from 'path'
import icon from '../../resources/icon.png?asset'

let watcher
let mainWindow
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    maximizable: false,
    resizable: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  // mainWindow.webContents.openDevTools()
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

function sendDataToVue(data) {
  mainWindow.webContents.send('data-to-vue', data)
}

function toastToVue(data) {
  mainWindow.webContents.send('toast-to-vue', data)
}

function setTerminal(color, result) {
  sendDataToVue({
    color: color,
    text: result
  })
}

function startFileWatcher() {
  const ordersFolder = 'Y:\\PDF'
  const targetFolder = 'W:\\'

  if (watcher) {
    console.log('File watcher is already running')
    return
  }

  watcher = chokidar.watch(ordersFolder, {
    ignored: /^\./,
    persistent: true
  })

  console.log(`Watching for changes in ${ordersFolder}`)

  setTerminal('fc-green', 'File Watcher Started...')

  async function tryMoveFile(filePath) {
    const fileName = basename(filePath)
    const fileDate = moment()

    const year = fileDate.format('YYYY')
    const month = fileDate.format('MM')
    const day = fileDate.format('DD')

    const destinationYearPath = join(targetFolder, year)
    const destinationMonthPath = join(destinationYearPath, month)
    const destinationDayPath = join(destinationMonthPath, day)

    const destinationPath = join(destinationDayPath, fileName)

    // Create Directory if they are not existed
    if (!fs.existsSync(destinationYearPath)) {
      setTerminal('fc-orange', `Checking if folder year ${year} exists`)
      await fsExtra.ensureDir(destinationYearPath)
      setTerminal('fc-green', `Folder ${destinationYearPath} created`)
    } else {
      setTerminal('fc-yellow', `Folder existed ${destinationYearPath}`)
    }

    if (!fs.existsSync(destinationMonthPath)) {
      setTerminal('fc-orange', `Checking if folder month ${month} exists`)
      await fsExtra.ensureDir(destinationMonthPath)
      setTerminal('fc-green', `Folder ${destinationMonthPath} created`)
    } else {
      setTerminal('fc-yellow', `Folder existed ${destinationMonthPath}`)
    }

    if (!fs.existsSync(destinationDayPath)) {
      setTerminal('fc-orange', `Checking if folder day ${day} exists`)
      await fsExtra.ensureDir(destinationDayPath)
      setTerminal('fc-green', `Folder ${destinationDayPath} created`)
    } else {
      setTerminal('fc-yellow', `Folder existed ${destinationDayPath}`)
    }

    // Retry moving the file with a delay after 10 seconds
    const maxRetries = 3
    let retries = 0

    fsExtra.copy(filePath, destinationPath, async (err) => {
      if (err) {
        if (err.code === 'EBUSY' && retries < maxRetries) {
          console.log(`Retrying (${retries + 1}/${maxRetries})...`)
          retries++
          setTimeout(() => tryMoveFile(filePath), 10000)
        } else {
          console.error(`Error copying ${fileName}: ${err.message}`)
        }
      } else {
        console.log(`Copied ${fileName} to ${destinationPath}`)

        // Remove the original file
        fsExtra.remove(filePath, async (removeErr) => {
          if (removeErr) {
            console.error(`Error removing ${fileName}: ${removeErr.message}`)
          } else {
            console.log(`Removed original file: ${filePath}`)

            // Process the extracted information immediately
            const extractRenderDetailIDResult = extractRenderDetailID(fileName)
            console.log('Extracted Information:', destinationPath)
            console.log('Patient RenderDetailID:', extractRenderDetailIDResult)

            // API Call
            const uploadedResult = await updatePath({
              ID: extractRenderDetailIDResult,
              DocumentPath: finalizeDocPath(destinationPath)
            })

            setTerminal('fc-green', uploadedResult)
            toastToVue(uploadedResult)

            // Continue to the next file after a 30-second delay
            setTimeout(processNextFile, 30000)
          }
        })
      }
    })
  }

  function processNextFile() {
    const nextFile = watcherQueue.shift()

    if (nextFile) {
      tryMoveFile(nextFile)
    } else {
      isProcessing = false
    }
  }

  let isProcessing = false // Flag to track whether a file is being processed
  const watcherQueue = [] // Queue to store files while one is being processed

  watcher.on('add', (filePath) => {
    const fileExtension = path.extname(filePath).toLowerCase()
    if (fileExtension === '.pdf' && !isProcessing) {
      isProcessing = true // Set flag to true, indicating a file is being processed
      watcherQueue.push(filePath) // Add file to the queue

      // Process the first file in the queue
      tryMoveFile(watcherQueue.shift())
    } else if (fileExtension === '.pdf') {
      // If isProcessing is true, add file to the queue
      watcherQueue.push(filePath)
    }
  })

  watcher.on('error', (error) => {
    console.error(`Error watching files: ${error}`)
  })
}

function stopFileWatcher() {
  if (watcher) {
    watcher.close()
    watcher = null
    sendDataToVue({
      color: 'fc-red',
      text: 'File Watcher Stopped.'
      // Add other extracted information here if needed
    })
    console.log('File Watcher stopped')
  } else {
    console.log('File watcher is not running')
  }
}

ipcMain.handle('startFileWatcher', () => {
  startFileWatcher()
})

ipcMain.handle('stopFileWatcher', () => {
  stopFileWatcher()
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
  startFileWatcher,
  stopFileWatcher
}
