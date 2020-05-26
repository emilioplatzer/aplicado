import { entryPoints } from "./common";

window.addEventListener("load", function(){
    var closeButton = document.getElementById('closeButton');
    //prueba commit con repo cambiado
    closeButton?.addEventListener("click", function () {
        navigator.sendBeacon(`/${entryPoints[entryPoints.kill]}`, new Date().toString())
        close();
    });
});
