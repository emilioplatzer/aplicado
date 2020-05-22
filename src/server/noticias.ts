import * as express from "express";

import * as open from "open";
import { Server } from "http";
import * as serveContent from "serve-content";

import { promises as fs } from "fs";
import * as Path from "path";

import { APP_TITLE } from "../client/common";

function conclude(resolve:()=>void, reject:(err?:Error|undefined)=>void, message?:string){
    return function(err?:Error|undefined){
        if(err){
            reject(err);
        }else{
            if(message){
                console.log(message);
            }
            resolve()
        }
    }
}

enum entryPoints {menu, kill, lista};

function quote(text:string){
    return text.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

const BotonCerrar=`
    <p><button id=closeButton>Click</button> to close the window and stop the server (and be patient).</p>
    <script>
    </script>`;


export class EasyServer{
    private app=express();
    private server?:Server;
    private killed?:true;
    constructor(){
    }
    listenEntryPoint(entryPoint:entryPoints, core:(req:express.Request, res:express.Response)=>void, method:('get'|'post')='get'){
        this.app[method](`/${entryPoints[entryPoint]}`, (req,res)=>{
            res.contentType('html');
            core(req,res)
        });
    }
    async createDinamicHtmlContent(entryPoint:entryPoints, core:(pushContent:(part: string)=>void)=>Promise<void>){
        this.listenEntryPoint(entryPoint, async (_req, res)=>{
            res.write(`'<head><title>${APP_TITLE}</title></head>`);
            res.write('<script src="lib/client.js"></script>');
            var pushContent=(part:string)=>{
                res.write(part);
            }
            await core(pushContent);
            res.end();
        })
    }
    async startListening():Promise<void>{
        this.createDinamicHtmlContent(entryPoints.menu, async (pushContent)=>{
            pushContent(`
                <h1>aplicado</h1>
                <p><a id=listLink href="/${entryPoints[entryPoints.lista]}">${entryPoints[entryPoints.lista]}</a></p>
                ${BotonCerrar}
            `);
        });
        this.createDinamicHtmlContent(entryPoints.lista, async (pushContent)=>{
            pushContent(`<h1 id=filesTitle>files</h1><ul>`);
            const basePath = 'fixtures/data';
            var dir = await fs.opendir(basePath);
            var index = 0;
            for await (const dirent of dir) {
                if(dirent.isFile()){
                    pushContent(`<li id="file${++index}">${quote(dirent.name)} `);
                    const status = await fs.stat(Path.join(basePath,dirent.name));
                    pushContent(` ${quote(status.ctime.toLocaleDateString())}</li>`)
                }
            }
            pushContent(`</ul>${BotonCerrar}`);
        });
        this.listenEntryPoint(entryPoints.kill, (_req, res)=>{
            console.log('recive kill')
            res.send('killing...');
            this.killed=true;
        }, 'post');
        this.app.use('/lib', (req,res,next)=>{
            return serveContent('./dist-client', {allowedExts:['','.html','js']})(req,res,next);
        });
        return new Promise((resolve, reject)=>{
            console.log('start to listen')
            this.server = this.app.listen(3303, conclude(resolve, reject, 'listening'));
        });
    }
    async becomesKilled(){
        return new Promise((resolve)=>{
            const interval = setInterval(()=>{
                if(this.killed){
                    console.log('detect kill')
                    clearInterval(interval);
                    resolve()
                }
            },1000);
        })
    }
    async stopListening(){
        console.log('closing... (this may take a while)')
        return new Promise((resolve,reject)=>{
            if(!this.server){
                return reject(new Error('server does not started yet'))
            }
            this.server.close(conclude(resolve,reject,'closed'));
        })
    }
}

export async function start(opts?:{skipOpen?:true, listeningServer?:EasyServer}){
    try{
        console.log('starting all');
        console.log('platform',process.platform);
        var server = opts && opts.listeningServer || new EasyServer();
        if(!(opts && opts.listeningServer)){
            await server.startListening();
        }
        if(!opts || !opts.skipOpen){
            open(`http://localhost:3303/${entryPoints[entryPoints.menu]}`);
        }
        await server.becomesKilled();
        await server.stopListening();
        console.log('end of all')
    }catch(err){
        console.log('exit wit error')
        console.log(err);
        process.exit(1);
    }
}


