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

### el enum y el require-bro

Para que funcione el UMD usé [require-bro](https://github.com/codenautas/require-bro/blob/HEAD/LEEME.md)
porque era lo que conocía y quería avanzar. Si bien funciona bien, hubiera preferido webpack que es una librería difundida.

El `enum` resultó una buena forma de agrupar los nombres de los entryPoints. 
Conversamos esto con Eugenio y descartamo otras alternativas.
   1. usar strings directos `'kill', 'menu'` tienen el problema de que no se puede refactorizar (o sea cambiar el nombre y que impacte en todos lados)
   1. Usar una serie de constantes: `const KILL='kill'; const MENU='menu'` refactoriza pero no hay tipo, 
      o sea si se pasa como parámetro `'kill2'` no va a fallar por tipos. 
      Pasando `'kill'` no falla por tipos ni comportamiento 
      pero es un punto débil porque no refactoriza ese caso
   1. Usar un objeto de puente `urls={kill: 'kill', menu: 'menu'}` tiene problemas similares a tener una serie de constantes

Aún así `enum` tiene un punto débil al mapear a strings y usar internamente number. 
Por ahora seguimos con esto pero estamos atentos a otras desventajas que puedan aparecer.

## Electron simultáneo

Empiezo con la idea de escribir código Electrón. Por ahora solo puse una pequeña capa Electrón como describo en [docs/ideas](https://github.com/codenautas/aplicado/blob/master/docs/ideas/electron-cliente-servidor.md#de-clienteservidor-a-express).

Agrego un destino dist-electron para contener la capa Electron. 

