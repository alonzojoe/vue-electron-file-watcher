import { app, shell, BrowserWindow, contextBridge, ipcMain } from 'electron'
import { join, basename } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import chokidar from 'chokidar'
import fs from 'fs'
import moment from 'moment/moment'
import path from 'path'
import store from '../renderer/src/store'
import { extractRenderDetailID, updatePath } from './service'
const terminalText = store.getters.getMessage
console.log(store)
let watcher
let mainWindow
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
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
// function startFileWatcher() {
//   const ordersFolder = 'D:\\ORDERS'
//   const targetFolder = 'D:\\O_DESTINATION'

//   if (watcher) {
//     console.log('File watcher is already running')
//     return
//   }

//   let isProcessing = false // Flag to track whether a file is being processed

//   watcher = chokidar.watch(ordersFolder, {
//     ignored: /^\./,
//     persistent: true
//   })

//   console.log(`Watching for changes in ${ordersFolder}`)

//   watcher.on('add', (filePath) => {
//     const fileExtension = path.extname(filePath).toLowerCase()
//     if (fileExtension === '.pdf' && !isProcessing) {
//       isProcessing = true // Set flag to true, indicating a file is being processed

//       const fileName = basename(filePath)
//       const fileDate = moment()

//       const year = fileDate.format('YYYY')
//       const month = fileDate.format('MM')
//       const day = fileDate.format('DD')

//       const destinationYearPath = join(targetFolder, year)
//       const destinationMonthPath = join(destinationYearPath, month)
//       const destinationDayPath = join(destinationMonthPath, day)

//       const destinationPath = join(destinationDayPath, fileName)

//       if (!fs.existsSync(destinationYearPath)) {
//         fs.mkdirSync(destinationYearPath)
//       }
//       if (!fs.existsSync(destinationMonthPath)) {
//         fs.mkdirSync(destinationMonthPath)
//       }
//       if (!fs.existsSync(destinationDayPath)) {
//         fs.mkdirSync(destinationDayPath)
//       }

//       // Retry moving the file with a delay (e.g., 500ms)
//       const maxRetries = 3
//       let retries = 0

//       const tryMoveFile = () => {
//         fs.rename(filePath, destinationPath, (err) => {
//           if (err) {
//             if (err.code === 'EBUSY' && retries < maxRetries) {
//               console.log(`Retrying (${retries + 1}/${maxRetries})...`)
//               retries++
//               setTimeout(tryMoveFile, 10000) // Retry after a delay
//             } else {
//               console.error(`Error moving ${fileName}: ${err.message}`)
//             }
//           } else {
//             console.log(`Moved ${fileName} to ${destinationPath}`)

//             // Process the extracted information every 30 seconds

//             const extractRenderDetailIDResult = extractRenderDetailID(fileName)

//             console.log('Extracted Information:')
//             console.log('Patient RenderDetailID:', extractRenderDetailIDResult)

//             // Add additional logic to handle the extracted information as needed

//             isProcessing = false // Set flag to false, indicating processing is complete
//           }
//         })
//       }

//       setTimeout(tryMoveFile, 30000) // Delay the transfer of the file
//     }
//   })

//   watcher.on('error', (error) => {
//     console.error(`Error watching files: ${error}`)
//   })
// }

function sendDataToVue(data) {
  mainWindow.webContents.send('data-to-vue', data)
}

function startFileWatcher() {
  const ordersFolder = 'D:\\ORDERS'
  const targetFolder = 'D:\\O_DESTINATION'

  if (watcher) {
    console.log('File watcher is already running')
    return
  }

  watcher = chokidar.watch(ordersFolder, {
    ignored: /^\./,
    persistent: true
  })

  console.log(`Watching for changes in ${ordersFolder}`)

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

    if (!fs.existsSync(destinationYearPath)) {
      fs.mkdirSync(destinationYearPath)
    }
    if (!fs.existsSync(destinationMonthPath)) {
      fs.mkdirSync(destinationMonthPath)
    }
    if (!fs.existsSync(destinationDayPath)) {
      fs.mkdirSync(destinationDayPath)
    }

    // Retry moving the file with a delay after 10 seconds
    const maxRetries = 3
    let retries = 0

    fs.rename(filePath, destinationPath, async (err) => {
      if (err) {
        if (err.code === 'EBUSY' && retries < maxRetries) {
          console.log(`Retrying (${retries + 1}/${maxRetries})...`)
          retries++
          setTimeout(() => tryMoveFile(filePath), 10000)
        } else {
          console.error(`Error moving ${fileName}: ${err.message}`)
        }
      } else {
        console.log(`Moved ${fileName} to ${destinationPath}`)

        // Process the extracted information immediately
        const extractRenderDetailIDResult = extractRenderDetailID(fileName)
        console.log('Extracted Information:', destinationPath)
        console.log('Patient RenderDetailID:', extractRenderDetailIDResult)

        const uploadedResult = await updatePath({
          ID: extractRenderDetailIDResult,
          DocumentPath: destinationPath
        })
        sendDataToVue({
          patientRenderDetailID: uploadedResult
          // Add other extracted information here if needed
        })

        // Add additional logic to handle the extracted information as needed

        // Continue to the next file after a 30-second delay
        setTimeout(processNextFile, 30000)
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
  const obj = {
    font: 'fs-red',
    text: 'sample0text'
  }
  store.commit('addMessage', obj)
  if (watcher) {
    watcher.close()
    watcher = null
    console.log('File watcher stopped')
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
