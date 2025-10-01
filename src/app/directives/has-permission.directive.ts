import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthService);

  private currentSlugs: Set<string> = new Set();
  private required: string[] = [];
  private embedded = false;

  @Input('hasPermission') set hasPermissionInput(value: string | string[]) {
    this.required = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  constructor() {
    // React to auth user changes (Angular signals)
    effect(() => {
      const user = this.auth.currentUser; // reading signal via getter
      this.currentSlugs = this.collectPermissions(user);
      this.updateView();
    });
  }

  private collectPermissions(user: any | null): Set<string> {
    const set = new Set<string>();
    if (!user?.roles?.length) return set;
    for (const role of user.roles) {
      if (role?.permissions?.length) {
        for (const p of role.permissions) {
          if (p?.slug) set.add(p.slug);
        }
      }
    }
    return set;
  }

  private hasAnyRequired(): boolean {
    if (!this.required.length) return true; // no requirement
    for (const need of this.required) {
      if (this.currentSlugs.has(need)) return true;
    }
    return false;
  }

  private updateView(): void {
    const allowed = this.hasAnyRequired();
    if (allowed && !this.embedded) {
      this.vcr.clear();
      this.vcr.createEmbeddedView(this.tpl);
      this.embedded = true;
    } else if (!allowed && this.embedded) {
      this.vcr.clear();
      this.embedded = false;
    }
  }
}
