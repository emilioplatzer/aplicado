# haciendo

## así lo voy haciendo

Arranco en [el tercer commit](../../commits/master/d699113294fe033fae664c0d1fc7c5c981e6173d) con un código fuertmente tipado que 
  1. lanza un servidor
  2. sirve una sola pagina `/lista` que devuelve una página que al cerrar manda la orden de matar `/kill`
  3. cierra solo (después de que se da cuenta que no tiene más conexiones)

## que cierre todo con un botón

El problema que tiene cerrar el servidor al cerrar la ventana es que no puedo navegar entre páginas porque se va a cerrar el servidor.

Voy a cambiar la actividad por un botón que cierre la ventana y el servidor simultáneamente

## que traiga una lista de datos reales

Los datos van a ser unos archivos que voy a tirar en una carpeta /fixtures/data

Por cada archivo quiero el nombre, el tamaño, la fecha y el tipo. 

### refactoring

Me encuentro que `/lista` estaba escrita dos veces, lo mismo que '/kill'. 
Aprovecho y cambio `/lista` por `/menu`.

