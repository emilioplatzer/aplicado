import { app, BrowserWindow , ipcMain } from 'electron';

import { APP_TITLE, EntryPoints, Commons } from '../client/common';

console.log(EntryPoints)

import { EasyServer } from '../server/noticias';
import { promises as fs } from 'fs';

var resultCounter=0;

async function createWindow(){
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            // contextIsolation: true
        }
    });
    console.log('abriendo el backend')
    var common = new Commons();
    common.setDevelMode({entryPointPrefix:'x'+Math.random()})
    var server = new EasyServer(common)
    var mainHtml = await server.createMainHtml({title:'Aplicado', scriptBasePath:process.cwd(), scripts:[
        ...server.scriptList(),
        {path:'dist-client/client/fe-noticias.js'}
    ]});
    ipcMain.on('getTitulos', (event, _arg) => {
        var resultId = `result_${resultCounter++}`;
        event.returnValue = resultId;
        server.getTitulos().then(
            (result:any )=>event.sender.send(resultId, {result}),
            (error:Error)=>event.sender.send(resultId, {error} ),
        )
    })
    var mainHtmlFileName = 'dist-electron/client/main-electron.html'
    await fs.writeFile(mainHtmlFileName, mainHtml, 'utf8');
    console.log('abriendo en index de', APP_TITLE);
    win.loadFile(mainHtmlFileName);
    //win.loadURL(`http://localhost:3303/${common.entryPointsString(EntryPoints.menu)}`)
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
