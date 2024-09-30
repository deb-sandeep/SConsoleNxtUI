import { Component } from '@angular/core';
import { CommonModule } from '@angular/common' ;
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap'
import { PageHeaderComponent } from 'lib-core';

type SectionMeta = {
  name:string            // The name of the section. Displayed in the accordion item header
  collapsed?:boolean     // Sets accordion item to collapsed. Default false
  modules:{              // A section can contain many module meta definitions
    name?:string         // The name of the module. Default empty string
    target:string        // The target page that click of this button should navigate to
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
      name : "Memory Gym",
      modules : [
        {
          name : "Speed<br>Arithmetic",
          icon : "bi-calculator",
          bgcolor : "#b9d2fc",
          target : '/memory-gym/speed-arithmetic/index.html'
        },
      ]
    }
  ] ;

  goToPage( pagePath : string ) {
    window.location.href = pagePath ;
  }
}
