const ipc = require('electron').ipcRenderer
const remote = require('electron').remote

remote.getCurrentWindow().removeAllListeners();

let from
let editarea = document.getElementById("edit-area")
let header = document.getElementById("header")
let title = document.getElementsByTagName("title")[0]

function growArea(area) {
    if (area.scrollHeight > area.clientHeight && area.scrollHeight < 1000) {
        //     area.style.height = area.scrollHeight + "px"
        // } else {
        area.style.height = "1000px"
    }
}

let fileName

ipc.on('contextmenu-edit', function(event, c) {
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

ipc.on('display-edit', function(event, content) {
    editarea.innerHTML = content;
    header.innerHTML = `<h1 class="title">Edit Files</h1><p class="subtitle">${fileName}</p><button onclick="console.log('clicked')" type="button" class="done-btn" id="save-btn">Save File</button>`
    console.log("file btn should exist")
    let savebtn = document.getElementById("save-btn")
    savebtn.addEventListener("click", btnClicked)
})

function btnClicked() {
    console.log("btnclicked")
        // console.log(editarea.value)
    if (from == "files") {
        ipc.send("save-view-file", fileName, editarea.value)
    } else {
        ipc.send("view-edited-paste", editarea.value)
    }
}

function insert(string, pos1, insert, pos2) {
    return string.substr(0, pos1) + insert + string.substr(pos2)
}

function textareaInsert(area, openTag, closeTag) {
    console.log("Triggered")
    let double = arguments.length > 2
    console.log(double)
    let selectStart = area.selectionStart,
        selectEnd = area.selectionEnd
    console.log(selectStart)
    console.log(selectEnd)
    let oldText = area.value
    area.value = insert(oldText, selectStart, double ? openTag + oldText.substr(selectStart, selectEnd - selectStart) + closeTag : openTag, selectEnd)
    area.setSelectionRange(double || selectStart == selectEnd ? selectStart + openTag.length : selectStart, (double ? selectEnd : selectStart) + closeTag.length)
    area.focus()
}

function textareaLineInsert(area, tag) {
    let oldText = area.value
    let position = area.selectionStart
    let lastPosition = oldText.lastIndexOf("\n", position)
    if(lastPosition !== -1) {
        area.value = insert(oldText, lastPosition + 1, tag, lastPosition + 1)
    } else {
        console.error("No newline found before the position")
    }
}

document.getElementById("bold").addEventListener("click", function() {
    textareaInsert(editarea, "**", "**")
})
document.getElementById("italics").addEventListener("click", function() {
    textareaInsert(editarea, "*", "*")
})
document.getElementById("strikethrough").addEventListener("click", function() {
    textareaInsert(editarea, "~~", "~~")
})

ipc.on("format", function(event, format) {
    switch (format) {
        case "bold":
            textareaInsert(editarea, "**", "**")
            break;
        case "italics":
            textareaInsert(editarea, "*", "*")
            break;
        case "header1":
            textareaLineInsert(editarea, "# ")
            break;
        case "header2":
            textareaLineInsert(editarea, "## ")
            break;
        case "header3":
            textareaLineInsert(editarea, "### ")
            break;
        case "header4":
            textareaLineInsert(editarea, "#### ")
            break;
        case "header5":
            textareaLineInsert(editarea, "##### ")
            break;
        case "header6":
            textareaLineInsert(editarea, "###### ")
            break;
        default:
            console.log("Format not available")
    }
})

console.log("edit.js loaded")

console.log(title.innerHTML)
