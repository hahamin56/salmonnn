const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

process.on('uncaughtException', e => { dialog.showErrorBox('MULTICRAFT: ошибка', String(e && e.stack || e)); });

// Игра лежит в папке "game" РЯДОМ с MULTICRAFT.exe — её можно менять без пересборки.
function gamePage() {
  const beside = path.join(path.dirname(process.execPath), 'game', 'index.html');
  return fs.existsSync(beside) ? beside : path.join(__dirname, 'game', 'index.html');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 800, minHeight: 500,
    title: 'MULTICRAFT', backgroundColor: '#000000', autoHideMenuBar: true,
    webPreferences: { backgroundThrottling: false }
  });
  win.setMenu(null);
  win.loadFile(gamePage()).catch(e => dialog.showErrorBox('Не удалось загрузить игру', String(e)));
  win.webContents.on('render-process-gone', (e, d) => dialog.showErrorBox('Игра упала', JSON.stringify(d)));
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') win.setFullScreen(!win.isFullScreen());
    if (input.key === 'F5') win.webContents.reload();
    if (input.key === 'F12') win.webContents.toggleDevTools();
  });
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
