import * as React from 'react';
import { 
    useEffect,
    useState,
    ReactChildren
} from 'react';
import { render }  from 'react-dom';

import { Button, createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';

import { TitulosData } from './common'

// import { EasyServer } from '../server/noticias';

enum Pantalla { principal, titulos }

const IrAPantalla = (props:{pantalla:Pantalla, setPantalla:(destino:Pantalla)=>void, children:ReactChildren|string}) => 
<Button color="secondary" id={Pantalla[props.pantalla]}
    onClick={()=>props.setPantalla(props.pantalla)}
>
    {props.children}
</Button>

const Titulos = (props:{setPantalla:(destino:Pantalla)=>void}) => {
    const [titulos, setTitulos] = useState<TitulosData[]>([
        {title:'...', date:new Date()}
    ]);
    useEffect(()=>{
        // @ts-ignore
        noticias.getTitulos({}).then(result=>setTitulos(result));
    },[])
    return <>
        <IrAPantalla pantalla={Pantalla.principal} setPantalla={props.setPantalla}> ⬅ </IrAPantalla>
        <h1 id="title-list">títulos</h1>
        <ul>
            {titulos.map((t, index) => <li key={t.title} id={`title-${index}`}>
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

const NoticiasReact = (/*props:{server:EasyServer}*/) => 
<ThemeProvider theme={theme}>
    <CssBaseline/>
    <PantallasReact/>
</ThemeProvider>;

window.addEventListener('load', ()=>{

    render(<NoticiasReact/>, document.getElementById('main-div'));
})
