import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnDestroy } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { effect } from '@angular/core';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnDestroy {
  private tmpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthService);

  private required: string | string[] | null = null;
  private cleanup?: () => void;

  @Input('hasPermission') set hasPermission(required: string | string[]) {
    this.required = required;
    this.updateView();
  }

  constructor() {
    // react to auth state changes
    const runner = effect(() => {
      // run when user changes
      void this.auth.user();
      this.updateView();
    });
    this.cleanup = () => runner.destroy();
  }

  private updateView() {
    const allowed = this.check();
    this.vcr.clear();
    if (allowed) {
      this.vcr.createEmbeddedView(this.tmpl);
    }
  }

  private check(): boolean {
    if (!this.required) return false;
    if (Array.isArray(this.required)) {
      return this.auth.hasAnyPermission(this.required);
    }
    return this.auth.hasPermission(this.required);
  }

  ngOnDestroy(): void {
    if (this.cleanup) this.cleanup();
  }
}
