window.addEventListener("load", function(){
    var closeButton = document.getElementById('closeButton');
    closeButton?.addEventListener("click", function () {
        navigator.sendBeacon('/kill',new Date().toString())
        close();
    });
});
