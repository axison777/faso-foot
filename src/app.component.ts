import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ExportMatchComponent } from './app/pages/export-match/export-match.component';
/**
 * <router-outlet></router-outlet>
 */
@Component({
    selector: 'app-root',
    standalone: true,
    providers: [ MessageService, ConfirmationService],
    imports: [RouterModule, ],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
