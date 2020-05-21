# haciendo

## así lo voy haciendo

Arranco en [el tercer commit](../../../../commit/d699113294fe033fae664c0d1fc7c5c981e6173d) con un código fuertmente tipado que 
  1. lanza un servidor
  2. sirve una sola pagina `/lista` que devuelve una página que al cerrar manda la orden de matar `/kill`
  3. cierra solo (después de que se da cuenta que no tiene más conexiones)

## que cierre todo con un botón

El problema que tiene cerrar el servidor al cerrar la ventana es que no puedo navegar entre páginas porque se va a cerrar el servidor.

Voy a cambiar la actividad por un botón que cierre la ventana y el servidor simultáneamente

## que traiga una lista de datos reales

Los datos van a ser unos archivos que voy a tirar en una carpeta `/fixtures/data`.

Por cada archivo quiero el nombre, el tamaño, la fecha y el tipo. 

### refactoring

Me encuentro que `/lista` estaba escrita dos veces, lo mismo que `/kill`. 
Aprovecho y cambio `/lista` por `/menu`.

## servir los headers correctos

Poner el Content-Type en los headers. 

Mirando como está, veo también que hay código Javascript metido dentro de strings,
eso hay que cambiarlo por código typescript que esté donde tenga que estar. 

## El .js que va al cliente esté en typescript

En un archivo separado que se compile por separado

### bug

Parecía que anda todo bien, pero el botón cerrar no lograba hacer que cierre el backend,
mirando un poco vi que el sendBeacon manda fruta (⛯ en vez de tocino 😉). 

## servir un .js con el enum

Pero escribirlo una sola vez en typescript y que eso sea el origen de lo que se mande al cliente
y el mismo archivo que use el `noticias.ts` para incluir el enum.
