import { EntryPoints } from "./common";

import { common } from "./common-instance";

declare global{
    namespace NodeJS{
        interface Process{
            type:string
        }
        interface ProcessVersions{
            electron:string
        }
    }
}

function isElectron() {
    // from https://github.com/cheton/is-electron/blob/master/index.js
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }
    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }
    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }
    return false;
}

function needsBackButton(){
    return isElectron();
}


window.addEventListener("load", function(){
    var closeButton = document.getElementById('closeButton');
    //prueba commit con repo cambiado
    closeButton?.addEventListener("click", () => {
        navigator.sendBeacon(`/${common.entryPointsString(EntryPoints.kill)}`, new Date().toString())
        close();
    });
    var backArrow = document.getElementById('back-arrow');
    if(backArrow!=null){
        if(needsBackButton()){
            backArrow.addEventListener('click', ()=>history.go(-1));
        }else{
            backArrow.style.display='none';
        }
    }
});
