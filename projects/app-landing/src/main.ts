import { ApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

export const appConfig: ApplicationConfig = {
    providers: []
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
