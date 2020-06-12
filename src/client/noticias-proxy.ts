import * as JSON4all from 'json4all';

export class Noticias{
    async getTitulos<T>(_args:{}){
        var result = await fetch('./ap2-getTitulos', {method:'post'});
        var text = await result.text();
        var data = JSON4all.parse<{err:string}|{ok:T}>(text);
        if('err' in data){
            throw new Error(data.err);
        }
        return data.ok;
    }
}

export var noticias = new Noticias();

declare global {
    interface Window {
        noticias:Noticias;
    }
}

window.noticias = noticias;

