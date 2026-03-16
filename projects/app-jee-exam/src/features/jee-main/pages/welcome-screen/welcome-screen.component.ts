import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'welcome-screen',
  imports: [
    FormsModule
  ],
  templateUrl: './welcome-screen.component.html',
  styleUrl: './welcome-screen.component.css'
})
export class WelcomeScreenComponent {
  private readonly now = new Date();

  private router = inject( Router ) ;
  private route = inject( ActivatedRoute );

  protected confirmation: boolean = false ;
  protected examDate: string = this.formatExamDate(this.now);
  protected shift: string = this.now.getHours() < 12 ? 'Morning' : 'Afternoon';

  protected proceed() {
    this.router.navigate( [ '../instruction-screen' ], { relativeTo: this.route } ).then();
  }

  private formatExamDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }
}
