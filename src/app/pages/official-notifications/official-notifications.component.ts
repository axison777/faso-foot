import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfficialMatchService } from '../../service/official-match.service';
import { Observable } from 'rxjs';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    matchId?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Component({
    selector: 'app-official-notifications',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h5>Notifications</h5>
                        <div class="flex gap-2">
                            <button class="p-button p-button-outlined" (click)="markAllAsRead()">
                                <i class="pi pi-check mr-2"></i>
                                Tout marquer comme lu
                            </button>
                            <button class="p-button p-button-outlined" (click)="refreshNotifications()">
                                <i class="pi pi-refresh mr-2"></i>
                                Actualiser
                            </button>
                        </div>
                    </div>

                    <div class="notifications-list" *ngIf="notifications$ | async as notifications; else loadingNotifications">
                        <div class="notification-item" 
                             *ngFor="let notification of notifications" 
                             [ngClass]="{ 'unread': !notification.read }"
                             (click)="markAsRead(notification.id)">
                            <div class="notification-icon" [ngClass]="getPriorityClass(notification.priority)">
                                <i class="pi" [ngClass]="getNotificationIcon(notification.type)"></i>
                            </div>
                            <div class="notification-content">
                                <div class="notification-header">
                                    <div class="notification-title">{{ notification.title }}</div>
                                    <div class="notification-time">{{ notification.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
                                </div>
                                <div class="notification-message">{{ notification.message }}</div>
                                <div class="notification-actions" *ngIf="notification.matchId">
                                    <button class="p-button p-button-sm p-button-text" 
                                            [routerLink]="['/officiel/match-details', notification.matchId]">
                                        <i class="pi pi-eye mr-1"></i>
                                        Voir le match
                                    </button>
                                </div>
                            </div>
                            <div class="notification-status">
                                <i class="pi pi-circle-fill" 
                                   [ngClass]="notification.read ? 'text-gray-400' : 'text-blue-500'"></i>
                            </div>
                        </div>
                    </div>

                    <ng-template #loadingNotifications>
                        <div class="text-center p-4">
                            <i class="pi pi-spin pi-spinner"></i>
                            <p class="mt-2">Chargement des notifications...</p>
                        </div>
                    </ng-template>

                    <div class="text-center p-4" *ngIf="(notifications$ | async)?.length === 0">
                        <i class="pi pi-bell text-4xl text-gray-400 mb-3"></i>
                        <p class="text-gray-500">Aucune notification</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .notifications-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .notification-item {
            display: flex;
            align-items: flex-start;
            padding: 1rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-card);
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }

        .notification-item:hover {
            background: var(--surface-hover);
            border-color: var(--primary-color);
        }

        .notification-item.unread {
            background: var(--blue-50);
            border-color: var(--blue-200);
        }

        .notification-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            flex-shrink: 0;
        }

        .icon-low {
            background: var(--green-100);
            color: var(--green-700);
        }

        .icon-medium {
            background: var(--orange-100);
            color: var(--orange-700);
        }

        .icon-high {
            background: var(--red-100);
            color: var(--red-700);
        }

        .notification-content {
            flex: 1;
        }

        .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }

        .notification-title {
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .notification-time {
            font-size: 0.75rem;
            color: var(--text-color-secondary);
            white-space: nowrap;
            margin-left: 1rem;
        }

        .notification-message {
            color: var(--text-color-secondary);
            margin-bottom: 0.75rem;
            line-height: 1.4;
        }

        .notification-actions {
            display: flex;
            gap: 0.5rem;
        }

        .notification-status {
            display: flex;
            align-items: center;
            margin-left: 1rem;
            flex-shrink: 0;
        }

        .notification-status i {
            font-size: 0.75rem;
        }
    `]
})
export class OfficialNotificationsComponent implements OnInit {
    notifications$: Observable<Notification[]>;

    constructor(private officialMatchService: OfficialMatchService) {
        this.notifications$ = this.officialMatchService.getNotifications();
    }

    ngOnInit() {}

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'MATCH_REMINDER':
                return 'pi-calendar';
            case 'REPORT_SUBMITTED':
                return 'pi-file-text';
            case 'INCIDENT_REPORTED':
                return 'pi-exclamation-triangle';
            case 'MATCH_CANCELLED':
                return 'pi-times-circle';
            case 'MATCH_POSTPONED':
                return 'pi-clock';
            case 'EVALUATION_REQUESTED':
                return 'pi-star';
            default:
                return 'pi-info-circle';
        }
    }

    getPriorityClass(priority: string): string {
        switch (priority) {
            case 'LOW':
                return 'icon-low';
            case 'MEDIUM':
                return 'icon-medium';
            case 'HIGH':
                return 'icon-high';
            default:
                return 'icon-low';
        }
    }

    markAsRead(notificationId: string) {
        this.officialMatchService.markNotificationAsRead(notificationId).subscribe(() => {
            this.refreshNotifications();
        });
    }

    markAllAsRead() {
        // Implémenter la logique pour marquer toutes les notifications comme lues
        console.log('Marquer toutes les notifications comme lues');
        this.refreshNotifications();
    }

    refreshNotifications() {
        this.notifications$ = this.officialMatchService.getNotifications();
    }
}