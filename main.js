const electron = require('electron')
    // Module to control application life.
const app = electron.app
    // Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu

const path = require('path')
const url = require('url')

const ipc = electron.ipcMain
const dialog = electron.dialog
const globalShortcut = electron.globalShortcut

const exec = require('child_process').exec
const execSync = require('child_process').execSync
const write = require('fs-jetpack').write

const {
    session
} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let cat

let menuPlate = [{
    label: "File",
    submenu: [{
        label: "Open",
        accelerator: "CommandOrControl+O",
        click: function() {
            dialog.showOpenDialog({
                properties: ['openFile']
            }, function(files) {
                if (files) {
                    readerWindow = new BrowserWindow({
                        width: 800,
                        height: 600
                    })
                    readerWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'reader.html'),
                        protocol: 'file:',
                        slashes: true
                    }))
                    readerWindow.on('closed', function() {
                        readerWindow = null
                    })
                    const cookie = {
                        url: 'http://localhost',
                        name: `read${readerWindow.id}`,
                        value: `files${files[0]}`
                    }
                    console.log(cookie.name)
                    session.defaultSession.cookies.set(cookie, (error) => {
                        if (error) console.error(error)
                    })
                    readerWindow.webContents.on('did-finish-load', () => {
                        session.defaultSession.cookies.set(cookie, function(error) {
                            if (error) console.error(error)
                        })
                        readerWindow.webContents.send('open-file-contents', markdownify(catFile(files)), cookie.name)
                    })
                }
            })
        }
    }, {
        label: "New Reader Window",
        accelerator: "CommandOrControl+N",
        click: function() {
            readerWindow = new BrowserWindow({
                width: 800,
                height: 600
            })
            readerWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'reader.html'),
                protocol: 'file:',
                slashes: true
            }))
            readerWindow.on('closed', function() {
                readerWindow = null
            })
        }
    }]
}, {
    label: "Edit",
    submenu: [{
        role: "undo"
    }, {
        role: "redo"
    }, {
        type: "separator"
    }, {
        role: "cut"
    }, {
        role: "copy"
    }, {
        role: "paste"
    }, {
        role: "pasteandmatchstyle"
    }, {
        role: "delete"
    }, {
        role: "selectall"
    }]
}, {
    label: "View",
    submenu: [{
        role: "reload"
    }, {
        role: "toggledevtools"
    }, {
        type: "separator"
    }, {
        role: "resetzoom"
    }, {
        role: "zoomin"
    }, {
        role: "zoomout"
    }, {
        type: "separator"
    }, {
        role: "togglefullscreen"
    }]
}, {
    label: "Window",
    submenu: [{
        role: "minimize"
    }, {
        role: "close"
    }]
}, {
    role: "help",
    submenu: []
}]

let contextMenuPlate = [{
    label: "Edit",
    click: function(item, win, event) {
        win.loadURL(`file://${__dirname}/editor.html`)
        win.webContents.on("did-finish-load", function() {
            console.log(win.id)
            session.defaultSession.cookies.get({
                name: `read${win.id}`
            }, (error, cookies) => {
                if (error) {
                    console.error(error)
                } else {
                    console.log(cookies[0])
                    win.webContents.send("contextmenu-edit", cookies[0])
                }
            })
        })
    }
}, {
    label: "Reveal File Location",
    click: function(item, win, event) {
        win.send("contextmenu-revealfilelocation", event)
    }
}]

const contextMenu = Menu.buildFromTemplate(contextMenuPlate)

if (process.platform === "darwin") {
    menuPlate.unshift({
            label: app.getName(),
            submenu: [{
                role: "about"
            }, {
                type: "separator"
            }, {
                role: "services",
                submenu: []
            }, {
                role: "hide"
            }, {
                role: "hideothers"
            }, {
                role: "unhide"
            }, {
                type: "separator"
            }, {
                role: "quit"
            }]
        })
        // "Edit" menu
    menuPlate[2].submenu.push({
            type: "separator"
        }, {
            label: "Speech",
            submenu: [{
                role: "startspeaking"
            }, {
                role: "stopspeaking"
            }]
        })
        // "Window" menu
    menuPlate[4].submenu = [{
        label: "Close",
        accelerator: "CommandOrControl+W",
        role: "close"
    }, {
        label: "Minimize",
        accelerator: "CommandOrControl+M",
        role: "minimize"
    }, {
        label: "Zoom",
        role: 'zoom'
    }, {
        type: "separator"
    }, {
        label: "Bring All to Front",
        role: "front"
    }]
}

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    return mainWindow

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

function catFile(file) {
    // exec('cat ' + file, function (error, out, errout) {
    //     cat = out
    // })
    // console.log(cat);
    // return cat
    return execSync('cat ' + file)
}

function markdownify(markdown) {
    markdown = String(markdown)
    markdown = markdown.replace(/\[/gi, "\\[")
    markdown = markdown.replace(/\]/gi, "\\]")
    markdown = markdown.replace(/\(/gi, "\\(")
    markdown = markdown.replace(/\)/gi, "\\)")
    markdown = markdown.replace(/\\;/gi, "\\[")
    markdown = markdown.replace(/;\\/gi, "\\]")
    markdown = markdown.replace(/\\:/gi, "\\(")
    markdown = markdown.replace(/:\\/gi, "\\)")
    markdown = markdown.replace(/]\\/gi, "\\]")
    markdown = markdown.replace(/\)\\/gi, "\\)")
    const MarkdownIt = require('markdown-it')
    let md = new MarkdownIt()
    return md.render(markdown)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
        createWindow()
        Menu.setApplicationMenu(Menu.buildFromTemplate(menuPlate))
    })
    // Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

app.on('browser-window-created', function(event, win) {
    win.webContents.on('context-menu', function(e, params) {
        contextMenu.popup(win, params.x, params.y)
    })
})

ipc.on('show-context-menu', function(event) {
    contextMenu.popup(BrowserWindow.fromWebContents(event.sender))
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipc.on('open-file', function(event) {
    const window = BrowserWindow.fromWebContents(event.sender)
    const files = dialog.showOpenDialog(window, {
        properties: ['openFile']
    }, function(files) {
        if (files) {
            const cookie = {
                url: 'http://localhost',
                name: `read${event.sender.id}`,
                value: `files${files[0]}`
            }
            console.log(cookie.name)
            session.defaultSession.cookies.set(cookie, (error) => {
                if (error) console.error(error)
            })
            event.sender.send('open-file-contents', markdownify(catFile(files)), cookie.name)
        }
    })
})

ipc.on('paste-file', function(event, content) {
    const cookie = {
        url: 'http://localhost',
        name: `read${event.sender.id}`,
        value: "paste" + escape(content)
    }
    console.log(cookie.value)
    session.defaultSession.cookies.set(cookie, (error) => {
        if (error) console.error(error)
    })
    event.sender.send('open-file-contents', markdownify(content), cookie.name)
})

ipc.on('contextmenu-edit', function(event, file) {
    event.sender.loadURL(`file://${__dirname}/editor.html`)
    event.sender.on('ready-to-show', event, catFile(file))
})

ipc.on('edit-files', function(event, files) {
    event.sender.send('display-edit', catFile(files))
})

ipc.on("view-edited-paste", function(event, content) {
    const cookie = {
        url: 'http://localhost',
        name: `read${event.sender.id}`,
        value: "paste" + escape(content)
    }
    session.defaultSession.cookies.remove("http://localhost", `read${event.sender.id}`, function(error) {
        if (error) {
            console.error(error)
        } else {
            console.log(`Removed cookie read${event.sender.id}`)
            session.defaultSession.cookies.set(cookie, (error) => {
                if (error) console.error(error);
                else console.log("Cookie set")
            })
        }
    })
    event.sender.loadURL(url.format({
        pathname: path.join(__dirname, 'reader.html'),
        protocol: 'file:',
        slashes: true
    }))
    event.sender.on("did-finish-load", function() {
        event.sender.send('open-file-contents', markdownify(content), cookie.name)
    })
})

ipc.on("save-view-file", function(event, file, content) {
    const cookie = {
        url: 'http://localhost',
        name: `read${event.sender.id}`,
        value: `files${file}`
    }
    session.defaultSession.cookies.remove("http://localhost", `read${event.sender.id}`, function(error) {
        if (error) {
            console.error(error)
        } else {
            console.log(`Removed cookie read${event.sender.id}`)
            session.defaultSession.cookies.set(cookie, (error) => {
                if (error) {
                    console.error(error)
                } else {
                    console.log("Cookie set")
                }
            })
        }
    })
    console.log("hi")
    write(file, content)
    event.sender.loadURL(url.format({
        pathname: path.join(__dirname, 'reader.html'),
        protocol: 'file:',
        slashes: true
    }))
    event.sender.on("did-finish-load", function() {
        event.sender.send('open-file-contents', markdownify(catFile(file)), cookie.name)
    })
})

app.on('ready', function() {
    const cookie = {
        url: 'http://www.github.com',
        name: 'dummy_name',
        value: 'dummy'
    }
    session.defaultSession.cookies.set(cookie, (error) => {
        // console.log("Error")
        if (error) console.error(error)
    })
})
