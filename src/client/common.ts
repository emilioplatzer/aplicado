export const APP_TITLE='PRUEBA APILADO';

export enum EntryPoints {menu, kill, lista};

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
    entryPointsString(entryPoints:EntryPoints){
        var prefix = this.develMode?.entryPointPrefix||'';
        return `${prefix}${EntryPoints[entryPoints]}`;
    }
}