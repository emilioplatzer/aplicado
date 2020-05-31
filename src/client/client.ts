import { EntryPoints } from "./common";

import { common } from "./common-instance";

window.addEventListener("load", function(){
    var closeButton = document.getElementById('closeButton');
    //prueba commit con repo cambiado
    closeButton?.addEventListener("click", () => {
        navigator.sendBeacon(`/${common.entryPointsString(EntryPoints.kill)}`, new Date().toString())
        close();
    });
});
