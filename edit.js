const ipc = require('electron').ipcRenderer
const remote = require('electron').remote

remote.getCurrentWindow().removeAllListeners();

let from
let editarea = document.getElementById("edit-area")
let header = document.getElementById("header")
let title = document.getElementsByTagName("title")[0]

function growArea (area) {
    if(area.scrollHeight > area.clientHeight && area.scrollHeight < 1000) {
    //     area.style.height = area.scrollHeight + "px"
    // } else {
        area.style.height = "1000px"
    }
}

let fileName

ipc.on('contextmenu-edit', function (event, c) {
    from = c.value.substr(0, 5)
    const content = unescape(c.value.substr(5))

    fileName = content
    console.log(c)
    console.log(from)
    if (from == "paste") {
        editarea.innerHTML = content;
        header.innerHTML = "<h1 class=\"title-paste\">Edit Paste</h1><button type=\"button\" class=\"done-btn\" id=\"view-btn\">View Paste</button>"
        title.innerHTML = "Edit Paste"
        let viewbtn = document.getElementById("view-btn")
        viewbtn.addEventListener("click", btnClicked)
        growArea(editarea)
    } else {
        ipc.send('edit-files', c.value.substr(5))
        title.innerHTML = "Editing " + fileName
    }
    // editarea.innerHTML = c.value
})

ipc.on('display-edit', function (event, content) {
    editarea.innerHTML = content;
    header.innerHTML = `<h1 class="title">Edit Files</h1><p class="subtitle">${fileName}</p><button onclick="console.log('clicked')" type="button" class="done-btn" id="save-btn">Save File</button>`
    console.log("file btn should exist")
    let savebtn = document.getElementById("save-btn")
    savebtn.addEventListener("click", btnClicked)
    savebtn.innerHTML = "RAWR"
})

function btnClicked () {
    console.log("btnclicked")
    // console.log(editarea.value)
    if (from == "files") {
        ipc.send("save-view-file", fileName, editarea.value)
    } else {
        ipc.send("view-edited-paste", editarea.value)
    }
}

console.log("edit.js loaded")

console.log(title.innerHTML)
