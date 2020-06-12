const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'noticias',
{
    getTitulos: async (args) =>{
        var channel = ipcRenderer.sendSync('getTitulos', args);
        return new Promise(function(resolve, reject){
            ipcRenderer.once(channel, function(_event , result){
                if(result.error) return reject(result.error);
                resolve(result.result);
            })
        })
    }
});