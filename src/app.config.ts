import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {

    providers: [

        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        
        {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,

        multi: true
        }
,
        providePrimeNG({
      ripple: true,
      translation: {
        accept: 'OK',
        reject: 'Annuler',
        dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
        dayNamesShort: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
        dayNamesMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
        monthNames: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        monthNamesShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
        today: "Aujourd'hui",
        clear: 'Effacer',
        dateFormat: 'dd/mm/yy',
        weekHeader: 'Sem',
        firstDayOfWeek: 1
      }
    },{ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },

         },

        )
    ]
};
