import { Component } from '@angular/core';
import { CommonModule } from '@angular/common' ;
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap'
import { PageHeaderComponent } from 'lib-core';

type SectionMeta = {
  name:string            // The name of the section. Displayed in the accordion item header
  collapsed?:boolean     // Sets accordion item to collapsed. Default false
  modules:{              // A section can contain many module meta definitions
    name?:string         // The name of the module. Default empty string
    icon?:string         // The name of bootstrap icon to be displayed. e.g. bi-alarm. Default no icon
    iconcolor?:string    // A HTML color code. Default black
    fgcolor?:string      // Foreground color. Default black
    bgcolor?:string      // Background color. Default aqua
  }[]
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule,NgbAccordionModule,PageHeaderComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title: string = 'Home' ;
  sections: SectionMeta[] = [
    {
      name : "Section-1",
      modules : [
        { name : "Module A", bgcolor: "red" },
        { name : "Module B", icon : "bi-alarm", iconcolor : "blue" },
        { name : "Bigger Module Name", fgcolor : "green" },
      ]
    },{
      name : "Section-2",
      modules : [
        { name : "Module D" },
      ]
    },{
      name : "Section-3",
      collapsed : true,
      modules : [
        { icon : "bi-exclamation-triangle" },
        { name : "Module F" },
      ]
    }
  ] ;
}
