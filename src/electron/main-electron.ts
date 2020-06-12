import { app, BrowserWindow , ipcMain} from 'electron';

import { APP_TITLE, Commons } from '../client/common';

import { EasyServer } from '../server/noticias';
import { promises as fs } from 'fs';

import * as Path from 'path';

var resultCounter=0;

async function createWindow(){
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload:process.cwd()+'/src/electron/electron-preload.js'
        }
    });
    console.log('abriendo el backend')
    var common = new Commons();
    common.setDevelMode({entryPointPrefix:'x'+Math.random()})
    var server = new EasyServer(common);
    var develMode = common.getDevelMode();
    var srcFunction = (s:{path:string, develPath?:string})=>
        Path.posix.join(process.cwd(), develMode && s.develPath || s.path);
    var mainHtml = await server.createMainHtml({title:'Aplicado', scripts:[
        ...server.scriptList(),
    ], srcFunction});
    ipcMain.on('getTitulos', (event, _arg) => {
        var resultId = `result_${resultCounter++}`;
        event.returnValue = resultId;
        server.getTitulos().then(
            (result:any )=>event.sender.send(resultId, {result}),
            (error:Error)=>event.sender.send(resultId, {error} ),
        )
    });
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
