## idea
# Simultáneamente: Cliente/servidor y Electrón 

Cuando hacemos una aplicación cliente/servidor con [Express](http://expressjs.com/)
tenemos un backend que hace `app.get` y `app.post` para exponer servicios al cliente,
y un frontend que hace `fetch` para obtener y enviar datos al backend.
Deberían quedar claras las responsabilidades del backend y del frontend y todos contentos. 

Una aplicación [Electrón](https://www.electronjs.org/) es una aplicación multiplataforma de escrictorio. 
Electrón sugiere [separar la proceso de visualización del proceso principal](https://www.electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes)
eso no es otra cosa que separar el backend del frontend. 

## de Cliente/Servidor a Express

Una manera fácil para pasar de una aplicación Cliente/servidor ya desarrollada a una Electrón 
es agregar la configuración electrón y seguir comunicándo el proceso visualizador con el princpal vía Express. Voilà!. 

Claro que hay algunos detalles que hay que resolver, por ejemplo en qué puerto va a antender express,
no puede ser un puerto fijo porque ya no es nuestro servidor es una aplicación que va a correr en cualquier máquina. 

## de Express a Cliente/Servidor

Si nuestro desarrollo Express es super prolijo y tenemos bien separados el proceso de visualización y el principal
podríamos agregar la capa Express para comunicar ambos procesos que serán nuestro frontend y backend. 

Simplificando podemos suponer que toda la comunicación entra por un objeto de la clase Principal y que esa clase solo publica métodos 
(si tiene miembros o propiedades son privadas o solo usadas por el proceso principal). 
Para cada método público hay que crear un entry-point (por ejemplo con `app.post`) en el backend
y un `fetch` en el frontend. Esos `fetchs` se pueden ponder dentro de una clase que también se llama Prinicpal
que solo forme parte del código del grontend y que haga las llamadas a los entry-points. 

### Algo así

electron-principal.ts
```ts
//...

type Noticia = {
    id:string
    autor:string
    titulo:string
    texto:string
}

class Principal{
    async getNoticias():Noticia[]{
        var noticias = await db.getNoticias({public:true});
        return noticias;
    }
}
```

electron-visualizador.tsx
```tsx
import {Principal} from "./electron-principal"

class Visualizador{
    private principal:Principal;
    async mostrarNoticias(){
        var noticias = await this.principal.getNoticias();
        this.render(
            <Paper>
                ${noticias.forEach(noticia=>
                    <Card key={noticia.id}>
                        <Typography color="textSecondary" gutterBottom>
                            {noticia.autor}
                        </Typography>
                        <Typography variant="h5" component="h2">
                            {noticia.titulo}
                        </Typography>
                        <Typography variant="body2" component="p">
                            {noticia.texto}
                        </Typography>
                    </Card>
                )}
            </Paper>
        )
    }
}
```

Podría adaptarse al modelo cliente servidor agregando una capa express:
```ts
import {Principal} from "./electron-principal"

function servirEntryPoints(){
    this.app.post('/entry-point/getNoticias',(_req,res)=>{
        var noticias = await this.principal.getNoticias();
        res.sendJson(noticias);
    })
}
```

Y un objeto Principal proxy:

express-principal-proxy.ts
```ts
export class Principal{
    async getNoticias(){
        var response = await fetch('/entry-point/getNoticias')
        return await response.json();
    } 
}
```

Luego es solo cuestión en el cliente de quitar las llamadas a Electrón y cambiar el import
```ts
// antes, en electron:
import {Principal} from "./electron-principal"

// luego, en express:
import {Principal} from "./express-principal-proxy"
```
