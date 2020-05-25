// import { entryPoints } from "./common";

window.addEventListener("load", function(){
    var closeButton = document.getElementById('closeButton');
    closeButton?.addEventListener("click", function () {
        // console.log('enum kill:'+entryPoints.kill)
        // console.log('enum:'+entryPoints);
        navigator.sendBeacon('/kill', new Date().toString())
        close();
    });
});
