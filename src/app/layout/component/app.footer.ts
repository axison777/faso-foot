import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Powered by
        <a href="https://tpe.bf" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Tech Pôle Expertise</a>
    </div>`
})
export class AppFooter {}
