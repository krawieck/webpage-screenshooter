const { app, BrowserWindow } = require('electron')

app.on('ready', () => {
  let win = new BrowserWindow({ width: 600, height: 400 })

  win.loadFile('gui.html')
})
