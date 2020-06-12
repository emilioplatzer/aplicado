import * as express from "express";

import * as open from "open";
import { Server } from "http";
import * as serveContent from "serve-content";

import { promises as fs } from "fs";
import * as Path from "path";

import { Commons, TitulosData } from "../client/common";

import * as JSON4all from "json4all";

function throwError(message:string):never{
    throw new Error(message);
}

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


interface ScriptForMainHtml {
    readonly path:string
    readonly develPath?:string
}
interface OptsCreateMainHtml {
    readonly title:string
    readonly scripts:ScriptForMainHtml[]
    readonly srcFunction:(pathInfo:{path:string}, i:number)=>string
}

export class EasyServer{
    private SAFE_EXTS = ['','html','js'];
    private app=express();
    private server?:Server;
    private servedPaths:{[k:string]:{hostPath:string}} = {}
    constructor(private common:Commons){
        console.log(this.common); // debe irse
    }
    async createMainHtml(opts:OptsCreateMainHtml){    
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
      ${opts.scripts.map((s,i)=>
        `<script src="${opts.srcFunction(s,i)}"></script>`
      ).join(`
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
            {path:'node_modules/json4all/json4all.js'},
            {path:'dist-client/client/adapt.js'},
            {path:'dist-client/client/fe-noticias.js'}
        ]
    }
    entryPointString(entryPoint:string){ return entryPoint };
    listenEntryPoint(entryPoint:string, core:(req:express.Request, res:express.Response)=>void, method:('get'|'post')='get'){
        this.app[method](`/${this.entryPointString(entryPoint)}`, (req,res)=>{
            res.contentType('html');
            core(req,res)
        });
    }
    addLibEntryPoint(opts:{hostPath:string, urlPath:string}):void
    addLibEntryPoint(opts:{fileName:string}):void
    addLibEntryPoint(opts:{fileName?:string, hostPath?:string, urlPath?:string}){
        var dirName = opts.fileName && Path.dirname(opts.fileName);
        var hostPath = opts.hostPath || opts.urlPath || dirName || throwError('addLibEntryPoint: lack of hostPath');
        var urlPath = opts.urlPath || opts.hostPath || dirName || throwError('addLibEntryPoint: lack of urlPath');
        if(this.servedPaths[urlPath]){
            if(this.servedPaths[urlPath].hostPath != hostPath){
                throw Error('addLibEntryPoint duplicate urlPath with different hostPath')
            }
        }else{
            this.app.use(urlPath, (req,res,next)=>{
                return serveContent(Path.join(process.cwd(), hostPath), {allowedExts:this.SAFE_EXTS})(req,res,next);
            });
            this.servedPaths[urlPath]={hostPath};
        }
    }
    async listenToServices(){
        this.listenEntryPoint('ap2-getTitulos', async (req, res)=>{
            try{
                console.log('params', req.query)
                var titulos = await this.getTitulos();
                res.send(JSON4all.stringify({ok:titulos}));
            }catch(err){
                res.send(JSON4all.stringify({err:err.message, in:'getTitulos'}));
            }
        }, 'post');
    }
    async startListening():Promise<void>{
        var server = this;
        var mainHtml = await server.createMainHtml({title:'Aplicado', scripts:[
            ...server.scriptList(),
            {path:'dist-client/client/noticias-proxy.js'}
        ], srcFunction:(s:{path:string}, index:number)=>`/lib${index+1}/${Path.basename(s.path)}`});
        var mainHtmlFileName = 'dist-client/client/index.html'
        await fs.writeFile(mainHtmlFileName, mainHtml, 'utf8');
        this.addLibEntryPoint({urlPath:'/', hostPath:'./dist-client/client/'});
        /*
        this.app.get('/lib/common-instance.js',async (req,res)=>{
            var content = await fs.readFile('./dist-client/common-instance.js',{encoding:'utf8'});
            content = content.replace(/{\s*\/\*COMMON_DEVEL_MODE\*\/\s*}/,JSON.stringify(this.common.getDevelMode()));
            MiniTools.serveText(content,'javascript')(req,res);
        });
        */
        var scriptList = [
            ...this.scriptList(),
            {path:'dist-client/client/noticias-proxy.js'}
        ];
        scriptList.forEach((module, index)=>{
            if(module.develPath){
                this.addLibEntryPoint({hostPath:Path.dirname(module.develPath), urlPath:`/lib${index+1}`});
            }
            this.addLibEntryPoint({hostPath:Path.dirname(module.path), urlPath:`/lib${index+1}`});
        })
        await this.listenToServices();
        return new Promise((resolve, reject)=>{
            console.log('start to listen')
            this.server = this.app.listen(3303, conclude(resolve, reject, 'listening'));
        });
    }
    async getTitulos():Promise<TitulosData[]>{
        var result:TitulosData[] = [];
        const basePath = 'fixtures/noticias';
        var dir = await fs.opendir(basePath);
        for await (const dirent of dir) {
            if(dirent.isFile() && dirent.name.endsWith('.md')){
                var content = await fs.readFile(Path.join(basePath,dirent.name), 'utf8');
                var title = content.match(/^#\s*([^\r\n]+)(\r\n|$)/)?.[1];
                const status = await fs.stat(Path.join(basePath,dirent.name));
                if(title){
                    result.push({title, date:status.ctime})
                }
            }
        }
        return result;
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

export async function start(opts?:{devel?:boolean, listeningServer?:EasyServer, common?:Commons}):Promise<EasyServer>{
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
        if(opts && opts.devel){
            await open(`http://localhost:3303/index.html`);
            await new Promise(function(resolve,reject){ setTimeout(conclude(resolve,reject,'ready to close when there are no connections'),1000)});
        }
        return server;
    }catch(err){
        console.log('exit wit error')
        console.log(err);
        process.exit(1);
    }
}


