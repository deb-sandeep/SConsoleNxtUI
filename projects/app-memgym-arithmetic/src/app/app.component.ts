import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common' ;
import { PageHeaderComponent } from 'lib-core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, PageHeaderComponent, RouterOutlet ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title: string = 'Memory Gym > Speed Arithmetic' ;
}
