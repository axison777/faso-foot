import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-club-coach-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './club-coach-layout.component.html',
  styleUrls: ['./club-coach-layout.component.scss']
})
export class ClubCoachLayoutComponent implements OnInit {
  private router = inject(Router);
  
  menuItems: MenuItem[] = [];
  activeRoute = '';
  isClubSpace = false;

  ngOnInit(): void {
    this.isClubSpace = this.router.url.includes('/mon-club');
    
    if (this.isClubSpace) {
      this.menuItems = [
        { label: 'Tableau de bord', icon: 'pi pi-chart-line', route: '/mon-club/dashboard' },
        { label: 'Matchs', icon: 'pi pi-calendar', route: '/mon-club/matchs' },
        { label: 'Joueurs', icon: 'pi pi-users', route: '/mon-club/joueurs' },
        { label: 'Paramètres', icon: 'pi pi-cog', route: '/mon-club/parametres' }
      ];
    } else {
      this.menuItems = [
        { label: 'Tableau de bord', icon: 'pi pi-chart-line', route: '/mon-equipe/dashboard' },
        { label: 'Matchs', icon: 'pi pi-calendar', route: '/mon-equipe/matchs' },
        { label: 'Joueurs', icon: 'pi pi-users', route: '/mon-equipe/joueurs' }
      ];
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.activeRoute = this.router.url;
    });
    
    this.activeRoute = this.router.url;
  }

  isActive(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }
}
