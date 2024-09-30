import { Component } from '@angular/core';
import { CommonModule } from '@angular/common' ;
import { PageHeaderComponent } from 'lib-core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, PageHeaderComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title: string = 'Memory Gym > Speed Arithmetic' ;
}
