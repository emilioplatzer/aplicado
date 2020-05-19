import * as express from "express";

import * as open from "open";
import { Server } from "http";

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

class EasyServer{
    private app=express();
    private server?:Server;
    private killed?:true;
    constructor(){
    }
    async startListening():Promise<void>{
        this.app.get('/lista', function(_req, res){
            res.send(`
                <h1>aplicado</h1>
                <p><button id=closeButton>Click</button> to close the window and stop the server (and be patient).</p>
                <script>
                    window.addEventListener("load", function(){
                        closeButton.addEventListener("click", function () {
                            navigator.sendBeacon('/kill',new Date().toString())
                            close();
                        });
                    });
                </script>
            `);
        });
        this.app.post('/kill', (_req, res)=>{
            res.send('killing...');
            console.log('recive kill')
            this.killed=true;
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
            this.server.close(conclude(resolve,reject,'closed'))
        })
    }
}


async function start(){
    try{
        console.log('starting all');
        console.log('platform',process.platform);
        const server = new EasyServer();
        await server.startListening();
        open('http://localhost:3303/lista');
        await server.becomesKilled();
        await server.stopListening();
        console.log('end of all')
    }catch(err){
        console.log('exit wit error')
        console.log(err);
        process.exit(1);
    }
}

start();

