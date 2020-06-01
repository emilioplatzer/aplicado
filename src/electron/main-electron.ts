import { app, BrowserWindow } from 'electron';

import { APP_TITLE, EntryPoints, Commons } from '../client/common';

import { start } from '../server/noticias';

async function createWindow(){
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true
        }
    });
    console.log('abriendo el backend')
    var common = new Commons();
    common.setDevelMode({entryPointPrefix:'x'+Math.random()})
    start({skipOpen:true, common});
    console.log('abriendo en index de ', APP_TITLE);
    //win.loadFile('index.html');
    win.loadURL(`http://localhost:3303/${common.entryPointsString(EntryPoints.menu)}`)
    win.webContents.openDevTools()
}

async function startElectron(){
    await app.whenReady();
    await createWindow();
    console.log('listo para usar');
}

startElectron();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
