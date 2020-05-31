import { start } from "./noticias";

import { Commons } from "../client/common";

var common = new Commons();
var prefix = 'e' + Math.floor(Math.random()*90+10).toString();
console.log('prefix',prefix);
common.setDevelMode({entryPointPrefix:prefix})

start({common});
