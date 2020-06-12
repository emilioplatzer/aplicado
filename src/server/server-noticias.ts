import { start } from "./noticias";

import { Commons } from "../client/common";

var common = new Commons();
var prefix = 'e' + Math.floor(Math.random()*90+10).toString();
console.log('prefix',prefix);
common.setDevelMode({entryPointPrefix:prefix})

var devel = true;

// const keypress = async () => {
//   process.stdin.setRawMode(true)
//   return new Promise(resolve => process.stdin.once('data', () => {
//     process.stdin.setRawMode(false)
//     resolve()
//   }))
// }

async function run(){
    // var server = 
    await start({common,devel});
    if(devel){
        console.log('keypress to exit')
        // await keypress();
        // server.stopListening();
    }
}

run();
