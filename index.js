const ipc = require('electron').ipcRenderer
const shell = require('electron').shell

const links = document.querySelectorAll('a[href]')

let info = document.getElementById("info")
let version = document.getElementById("version")

ipc.send('get-info')

ipc.on('info', function (event, vrsn) {
    console.log(vrsn)
    version.innerHTML = `<strong>Version:</strong> <code>${vrsn}</code>`
})

Array.prototype.forEach.call(links, function (link) {
  const url = link.getAttribute('href')
  if (url.indexOf('http') === 0) {
    link.addEventListener('click', function (e) {
      e.preventDefault()
      shell.openExternal(url)
    })
  }
})
