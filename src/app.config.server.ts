import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app/app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    ...appConfig.providers
  ]
};

export default serverConfig; 