import { app, shell, BrowserWindow, contextBridge, ipcMain, nativeImage } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { extractRenderDetailID, updatePath, finalizeDocPath, checkApi } from './service'
import { join, basename } from 'path'
import chokidar from 'chokidar'
import fs from 'fs'
import fsExtra from 'fs-extra'
import moment from 'moment/moment'
import path from 'path'
import icon from '../../resources/electron.png?asset'
import db from './service/database'

let watcher
let mainWindow

async function updateSettings(settings) {
  const { orders, target, api } = settings
  await db.run(
    `
    UPDATE settings 
    SET ordersDirectory = ?,
        targetDirectory = ?,
        electronApiPath = ?
    WHERE id = 1,`,
    [orders, target, api]
  )
}

async function getSettings() {
  return new Promise((resolve) => {
    db.get('SELECT * FROM settings ORDER BY id DESC LIMIT 1', (err, row) => {
      if (err) {
        console.error('Error retrieving settings:', err)
        resolve(null)
      } else {
        resolve(row)
      }
    })
  })
}

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
    },
    icon: path.join(__dirname, '../../resources/icon-new.ico')
  })

  mainWindow.setMenu(null)
  mainWindow.webContents.openDevTools()
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.setThumbarButtons([
    {
      tooltip: 'button1',
      icon: nativeImage.createFromPath(path.join(__dirname, '../../resources/icon.png')),
      click() {
        console.log('button1 clicked')
      }
    },
    {
      tooltip: 'button2',
      icon: nativeImage.createFromPath(path.join(__dirname, '../../resources/icon.png')),
      flags: ['enabled', 'dismissonclick'],
      click() {
        console.log('button2 clicked.')
      }
    }
  ])

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

function apiToVue() {
  mainWindow.webContents.send('api-not-found', true)
}

function retrieveData() {
  getSettings()
    .then((data) => {
      console.log('promis retrieved data', data)
      mainWindow.webContents.send('settings-to-vue', data)
    })
    .catch((error) => {
      console.log('error in sqlite', error)
    })
}

function settingsTovue() {
  mainWindow.webContents.send('settings-to-vue', true)
}

function setTerminal(color, result) {
  const formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS')
  sendDataToVue({
    timestamp: formattedDateTime,
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
  let apiChecker
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
    apiChecker = await checkApi()
    if (apiChecker !== true) {
      stopFileWatcher()
      apiToVue()
      return
    }
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
        apiChecker = await checkApi()
        if (apiChecker !== true) {
          stopFileWatcher()
          apiToVue()
          return
        }
        if (err.code === 'EBUSY' && retries < maxRetries) {
          console.log(`Retrying (${retries + 1}/${maxRetries})...`)
          retries++
          setTimeout(() => tryMoveFile(filePath), 10000)
        } else {
          console.error(`Error copying ${fileName}: ${err.message}`)
          // Handle the error or log additional information.
        }
      } else {
        console.log(`Copied ${fileName} to ${destinationPath}`)

        // Remove the original file
        fsExtra.remove(filePath, async (removeErr) => {
          if (removeErr) {
            apiChecker = await checkApi()
            if (apiChecker !== true) {
              stopFileWatcher()
              apiToVue()
              return
            }
            console.error(`Error removing ${fileName}: ${removeErr.message}`)
          } else {
            console.log(`Removed original file: ${filePath}`)

            // Process the extracted information immediately
            const extractRenderDetailIDResult = extractRenderDetailID(fileName)
            console.log('Extracted Information:', destinationPath)
            console.log('Patient RenderDetailID:', extractRenderDetailIDResult)
            //API Checker
            apiChecker = await checkApi()
            if (apiChecker !== true) {
              stopFileWatcher()
              apiToVue()
              return
            }
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
      // Check if the file still exists
      if (fs.existsSync(filePath)) {
        isProcessing = true
        watcherQueue.push(filePath)
        tryMoveFile(watcherQueue.shift())
      } else {
        console.error(`File does not exist: ${filePath}`)
      }
    } else if (fileExtension === '.pdf') {
      if (fs.existsSync(filePath)) {
        watcherQueue.push(filePath)
      } else {
        console.error(`File does not exist: ${filePath}`)
      }
    }
  })

  watcher.on('unlink', (filePath) => {
    console.error(`File deleted before processing: ${filePath}`)
  })

  watcher.on('error', (error) => {
    console.error(`Error watching files: ${error}`)
  })
}

function stopFileWatcher() {
  const formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS')
  if (watcher) {
    watcher.close()
    watcher = null
    sendDataToVue({
      timestamp: formattedDateTime,
      color: 'fc-red',
      text: 'File Watcher Stopped.'
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

ipcMain.handle('saveSettings', (event, settings) => {
  console.log('settings', settings)
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
  retrieveData()

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
