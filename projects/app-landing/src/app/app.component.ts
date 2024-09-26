import { Component } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap'
import { PageHeaderComponent } from 'lib-core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgbAccordionModule,PageHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title: string = '> Home' ;
  items: string[] = ['First','Second','Third'] ;
}
