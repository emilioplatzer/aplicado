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

## Me preocupan los nombres de los entry-points

La forma que tienen los entry points son cómodos para hacer refactoring y para asegurarse que va el tipo correcto,
pero tiene un defecto, no hay modo de asegurarse que algún programador distraído escriba el texto a mano. 

Entonces se me ocurre que en durante el desarrollo todos los nombres de los entry-point estén prefijados por un número al azar,
de ese modo no hay manera de poner uno a mano y que funcione.
Es cierto que eso va a saltar duarnte las pruebas de uso. Pero vamos a estar en una mejor situación.

Entonces el _idiom_ para los strings de los entry points tiene que ser llamar a una función y no al arreglo que invierte el enum.

```ts
// O sea en vez de
app.get(`/${entryPoints[entryPoints.kill]}`);

// Usar
app.get(`/${entryPointsStr(entryPoints.kill)}`);
```

### desarrollo del prefijo de los entry-points

En el último commit tuve que tocar demasiadas cosas para lo que parecía una tarea sencilla. 

Poner una función hubiera sido fácil, lo que pasó es que al sortear un prefijo había que trasmitir ese sorteo al cliente. 
Además para el caso de prueba era necesario conocer también el prefijo 
(o en todo caso el mecanismo, inicializado, de armar los textos de los entry points). 

Para eso tuve que poder transmitir de una forma dinámica el conocimiento (el valor sorteado) entre el servidor y el cliente.

## Seguridad 1

Ahí me di cuenta que estaba dando advertencias de inseguro. 
Así que en base a https://www.electronjs.org/docs/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content
hice algunos cambios que subo ahora. 

## Electron primero

Voy a tratar de invertir la lógica. 
Hacer que funcione primero en Electron y derivar de ahí el modelo cliente servidor. 

Espero que eso simplifique los entry-points (aunque seguirán los problemas de las pruebas, quizás).
Invirtiendo la lógica los entry-points deberían conocerse solo para la serialización entre front-end y back-end. 

## Aclarar la funcionalidad

Para ordenar lo que sigue tengamos en cuenta [¿qué vamos a construir?](https://github.com/codenautas/aplicado#qu%C3%A9-vamos-a-construir).
Voy a mejorar un poco la funcionalidad actual (sin cambiar la estructura del sistema) para que se parezca mas a la idea original.

### noticias de ayer

Agregué una carpeta `/fixtures/noticias` donde hay un archivo por noticia del que se puede extraer el título y la fecha.
Ahora el sistema tiene una página de bienvenida y una de noticias donde por ahora solo muestra el título y la fecha.

Ahí se podría haber usado funciones `obtenerTitulo` y `obtenerFecha`, ya aparecerán. 

### botón volver

Electrón no tiene la barra de navegación. Así que agregué el botón volver. 
Hay otras situaciones donde habría que agregarlo también (por ejemplo si se hace una [PWA](https://developers.google.com/web/fundamentals/codelabs/your-first-pwapp?hl=es)). 

Por eso en vez de preguntar si estoy en Electrón, pregunto si necesito un botón volver.



