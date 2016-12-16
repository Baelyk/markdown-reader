const ipc = require('electron').ipcRenderer

const openFile = document.getElementById('open')
const catFile = document.getElementById('cat')

const mathJaxHelper = require('mathjax-electron')

let cookie = {}

// openFile.addEventListener('click', function (event) {
//     ipc.send('open-file')
// })

// catFile.addEventListener('click', function (event) {
//     ipc.send('open-file', document.getElementById("file-path").innerHTML)
// })

// ipc.on('selected-file', function(event, path) {
//     document.getElementById("file-path").innerHTML = path
// })

ipc.on('open-file-contents', function (event, contents, cookieName) {
    cookie.name = cookieName
    // document.getElementById("file-title").innerHTML = files
    document.getElementById('page').innerHTML = contents
    mathJaxHelper.loadAndTypeset(document, document.getElementById('page'), function () {
        console.log("MathJax loaded")
    })
})

ipc.on('contextmenu-edit', function (event, c) {
    console.log(":(")
})

var page = document.getElementById("page")
var selectpage = document.getElementById("select-page")
var selectpagebtn = document.getElementById("select-page-btn")
var pastepage = document.getElementById("paste-page")
var pastepagearea = document.getElementById("paste-page-area")
var pastepagebtn = document.getElementById("paste-page-btn")

function growArea (area) {
    if(area.scrollHeight > area.clientHeight) {
        area.style.height = area.scrollHeight + "px"
    }
}

selectpagebtn.addEventListener("click", function (event) {
    ipc.send('open-file')
})
pastepagebtn.addEventListener("click", function (event) {
    ipc.send("paste-file", pastepagearea.value)
})
pastepagearea.addEventListener("input", function (event) {
    if(pastepagearea.value !== "") {
        pastepagebtn.disabled = false;
        pastepagebtn.className = "paste-page-btn-enable"
    } else if (pastepagearea.value === "") {
        pastepagebtn.disabled = true;
        pastepagebtn.className = "paste-page-btn"
    }
    growArea(pastepagearea)
})
