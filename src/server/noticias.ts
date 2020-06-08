import * as express from "express";

import * as open from "open";
import { Server } from "http";
import * as serveContent from "serve-content";

import { promises as fs } from "fs";
import * as Path from "path";
import * as MiniTools from "mini-tools";

import { APP_TITLE, EntryPoints, Commons } from "../client/common";

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

function quote(text:string){
    return text.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

const BotonCerrar=`
    <p><button id=closeButton>Click</button> to close the window and stop the server (and be patient).</p>`;


interface ScriptForMainHtml {
    readonly path:string
    readonly develPath?:string
}
interface OptsCreateMainHtml {
    readonly title:string
    readonly scripts:ScriptForMainHtml[]
    readonly scriptBasePath:string
}

export class EasyServer{
    private SAFE_EXTS = ['','.html','js'];
    private app=express();
    private server?:Server;
    private killed?:true;
    constructor(private common:Commons){
    }
    async createMainHtml(opts:OptsCreateMainHtml){
        var develMode = this.common.getDevelMode();
        return (
`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>${quote(opts.title)}</title>
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'self'; 
        style-src   'self' 'unsafe-inline' *.googleapis.com https://fonts.googleapis.com/css; 
        font-src    'self' https://*.gstatic.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
  </head>
  <body>
    <div id=main-div>
    </div>
    <div id=all-scripts>
      ${opts.scripts.map(s=>`<script src="${Path.join(opts.scriptBasePath, develMode && s.develPath || s.path)}"></script>`).join(`
      `)}
    </div>
  </body>
</html>`);
    }
    scriptList():ScriptForMainHtml[]{
        return [
            {develPath:'node_modules/react/umd/react.development.js', path:'node_modules/react/umd/react.production.min.js'},
            {develPath:'node_modules/react-dom/umd/react-dom.development.js', path:'node_modules/react-dom/umd/react-dom.production.min.js'},
            {develPath:'node_modules/@material-ui/core/umd/material-ui.development.js', path:'node_modules/@material-ui/core/umd/material-ui.production.min.js'},
            {path:'node_modules/require-bro/lib/require-bro.js'},
            {path:'dist-client/client/adapt.js'},
        ]
    }
    listenEntryPoint(entryPoint:EntryPoints, core:(req:express.Request, res:express.Response)=>void, method:('get'|'post')='get'){
        this.app[method](`/${this.common.entryPointsString(entryPoint)}`, (req,res)=>{
            res.contentType('html');
            core(req,res)
        });
    }
    async createDinamicHtmlContent(entryPoint:EntryPoints, core:(pushContent:(part: string)=>void)=>Promise<void>){
        this.listenEntryPoint(entryPoint, async (_req, res)=>{
            res.write(`<head>
                <title>${APP_TITLE}</title>
                <meta http-equiv="Content-Security-Policy" content="default-src 'self'">
            </head>`);
            res.write('<script src="require-bro/require-bro.js"></script>');
            res.write('<script src="lib/common.js"></script>');
            res.write('<script src="lib/common-instance.js"></script>');
            res.write('<script src="lib/client.js"></script>');
            var pushContent=(part:string)=>{
                res.write(part);
            }
            await core(pushContent);
            res.end();
        })
    }
    getBackButtonIfNeeded(){
        return '<button id=back-arrow>⬅</button> '
    }
    async startListening():Promise<void>{
        this.createDinamicHtmlContent(EntryPoints.menu, async (pushContent)=>{
            pushContent(`
                ${BotonCerrar}
            `);
        });
        this.createDinamicHtmlContent(EntryPoints.lista, async (pushContent)=>{
            pushContent(this.getBackButtonIfNeeded());
            pushContent(`<h1 id=filesTitle>files</h1><ul>`);
            const basePath = 'fixtures/noticias';
            var dir = await fs.opendir(basePath);
            var index = 0;
            for await (const dirent of dir) {
                if(dirent.isFile() && dirent.name.endsWith('.md')){
                    var content = await fs.readFile(Path.join(basePath,dirent.name), 'utf8');
                    var title = content.match(/^#\s*([^\r\n]+)(\r\n|$)/)?.[1];
                    if(title){
                        pushContent(`<li id="file${++index}"><b>${quote(title)}</b> `);
                        const status = await fs.stat(Path.join(basePath,dirent.name));
                        pushContent(` ${quote(status.ctime.toLocaleDateString())}</li>`)
                    }
                }
            }
            pushContent(`</ul>${BotonCerrar}`);
        });
        this.listenEntryPoint(EntryPoints.kill, (_req, res)=>{
            console.log('recive kill')
            res.send('killing...');
            this.killed=true;
        }, 'post');
        this.app.get('/lib/common-instance.js',async (req,res)=>{
            var content = await fs.readFile('./dist-client/common-instance.js',{encoding:'utf8'});
            content = content.replace(/{\s*\/\*COMMON_DEVEL_MODE\*\/\s*}/,JSON.stringify(this.common.getDevelMode()));
            MiniTools.serveText(content,'javascript')(req,res);
        });
        [
            {urlPart:'/require-bro', serverPath:'./node_modules/require-bro/lib/'},
            {urlPart:'/lib', serverPath:'./dist-client'}
        ].forEach((module)=>{
            this.app.use(module.urlPart, (req,res,next)=>{
                return serveContent(module.serverPath, {allowedExts:this.SAFE_EXTS})(req,res,next);
            });
        })
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

export async function start(opts?:{skipOpen?:true, listeningServer?:EasyServer, common?:Commons}){
    try{
        console.log('starting all');
        console.log('platform',process.platform);
        var common=opts && opts.common || new Commons();
        if(!opts || !opts.common){
            common.setDevelMode({});
        }
        var server = opts && opts.listeningServer || new EasyServer(common);
        if(!(opts && opts.listeningServer)){
            await server.startListening();
        }
        if(!opts || !opts.skipOpen){
            open(`http://localhost:3303/${common.entryPointsString(EntryPoints.menu)}`);
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


