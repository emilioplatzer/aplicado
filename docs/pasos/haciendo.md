# haciendo

## así lo voy haciendo

Arranco en d699113294fe033fae664c0d1fc7c5c981e6173d con un código fuertmente tipado que
  1. lanza un servidor
  2. sirve una sola pagina `/lista` que devuelve una página que al cerrar manda la orden de matar `/kill`
  3. cierra solo (después de que se da cuenta que no tiene más conexiones)

## que cierre todo con un botón

El problema que tiene cerrar el servidor al cerrar la ventana es que no puedo navegar entre páginas porque se va a cerrar el servidor.

Voy a cambiar la actividad por un botón que cierre la ventana y el servidor simultáneamente
