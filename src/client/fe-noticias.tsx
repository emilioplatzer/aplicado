import * as React from 'react';
import { 
    useState,
    ReactChildren
} from 'react';
import { render}  from 'react-dom';

import { Button, createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';

enum Pantalla { principal, titulos }

type TitulosData = {title:string, date:Date};

const IrAPantalla = (props:{pantalla:Pantalla, setPantalla:(destino:Pantalla)=>void, children:ReactChildren|string}) => 
<Button color="secondary"
    onClick={()=>props.setPantalla(props.pantalla)}
>
    {props.children}
</Button>

const Titulos = (props:{setPantalla:(destino:Pantalla)=>void}) => {
    const titulos: TitulosData[] = [{
        title:'ejemplo1', date:new Date()
    },{
        title:'ejemplo 2', date:new Date()
    },];
    return <>
        <IrAPantalla pantalla={Pantalla.principal} setPantalla={props.setPantalla}> ⬅ </IrAPantalla>
        <h1 id="filesTitle">títulos</h1>
        <ul>
            {titulos.map((t, index) => <li key={t.title} id={`file${index}`}>
                <b>{t.title}</b>
                {t.date.toLocaleDateString()}
            </li>)}
        </ul>
   </>
}

const PantallasReact = () => {
    var [pantalla, setPantalla] = useState(Pantalla.principal);
    switch(pantalla){
        case Pantalla.principal:return <>
            <h1>Bienvenido a Aplicado</h1>
            <p>El primer 
                <IrAPantalla pantalla={Pantalla.titulos} setPantalla={setPantalla}> portal de noticias </IrAPantalla>
            que solo sirve para ilustrar esto</p>
        </>;
        case Pantalla.titulos:return <Titulos setPantalla={setPantalla}/>
    }
}

const theme = createMuiTheme({
  overrides: {
    MuiCssBaseline: {
      '@global': {
        html: {
          WebkitFontSmoothing: 'auto',
        },
      },
    },
  },
});

const NoticiasReact = () => 
<ThemeProvider theme={theme}>
    <CssBaseline/>
    <PantallasReact/>
</ThemeProvider>;

window.addEventListener('load', ()=>{
    render(<NoticiasReact/>, document.getElementById('main-div'));
})
