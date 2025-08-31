import { Injectable, signal } from "@angular/core";
import { FeatureMenuItemMeta } from "lib-core";



@Injectable({ providedIn: 'root' })
export class UIStateService {

    appTitle = signal( "" ) ;

    menubarMeta : FeatureMenuItemMeta[] = [
        { iconName:'calculator',  routePath:'/rapid-calc', selected:false },
        { iconName:'grid-3x2',  routePath:'/periodic-table', selected:false },
    ] ;

    setAppTitle( newTitle: string ) {
        this.appTitle.set( newTitle ) ;
    }

    highlightMenuBarIcon( routePath:string ) {
        for( const meta of this.menubarMeta ) {
            meta.selected = meta.routePath.endsWith( routePath ) ;
        }
    }
}
