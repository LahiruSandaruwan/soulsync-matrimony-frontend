import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'matrimony-frontend';

  constructor(private notificationService: NotificationService) {}

  async ngOnInit(): Promise<void> {
    // Auto-subscribe to push after login, if enabled
    if (environment.notifications.enablePush && environment.performance.enablePWA) {
      const vapid = (environment as any).notifications?.vapidPublicKey;
      if (vapid) {
        try {
          await this.notificationService.ensurePushSubscription(vapid);
        } catch {
          // ignore silently
        }
      }
    }
  }
}
