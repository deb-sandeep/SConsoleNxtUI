import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'mol-viewer',
    template: `<div #host class="mol-viewer"></div>`,
    styles: `
        .mol-viewer {
            width: 100%;
            height: 100%;
            position: relative;
            background-color: #f1f1f1;
            padding: 10px 10px 10px 10px;
        }
    `
})
export class MolViewerComponent implements AfterViewInit {

    @ViewChild('host', { static: true })
    host!: ElementRef<HTMLDivElement> ;

    @Input() mol3D: string | undefined = undefined ;

    private viewer: any ;

    async ngAfterViewInit() {

        const mod = await import( '3dmol/build/3Dmol.js' ) ;  // ESM-friendly entry

        const $3Dmol = ( mod as any ).default || ( window as any ).$3Dmol ;
        this.viewer = $3Dmol.createViewer( this.host.nativeElement, {
            backgroundColor: '#f1f1f1'
        } ) ;
    }

    ngOnChanges() {
        if( this.mol3D && this.mol3D != "" ) {
            this.viewer.clear() ;
            this.viewer.addModel( this.mol3D, 'sdf' ) ;
            this.viewer.setStyle({}, {
                stick: {
                    radius: 0.1,
                    doubleBondScaling: 0.8,
                },
                sphere: {
                    radius: 0.3
                }
            });
            this.viewer.zoomTo();
            this.viewer.render();
        }
        else {
            if( this.viewer ) {
                this.viewer.clear() ;
            }
        }
    }
}
