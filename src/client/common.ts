export const APP_TITLE='PRUEBA APILADO';

export type DevelMode={
    entryPointPrefix:string
}
export class Commons{
    private develMode?:DevelMode;
    setDevelMode(develMode?:Partial<DevelMode>){
        this.develMode=develMode && {entryPointPrefix:Math.random().toString(), ...develMode}
    }
    getDevelMode(){
        return this.develMode;
    }
}

export type TitulosData = {title:string, date:Date};
