import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-root',
    standalone: true,
    providers: [ MessageService],
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
