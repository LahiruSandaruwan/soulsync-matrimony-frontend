import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
  
  /**
   * Navigate back to the previous page
   */
  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/dashboard';
    }
  }
  
  /**
   * Navigate to home dashboard
   */
  goHome(): void {
    window.location.href = '/dashboard';
  }
  
  /**
   * Report broken link to support
   */
  reportBrokenLink(): void {
    const currentUrl = window.location.href;
    const mailtoLink = `mailto:support@soulsync.com?subject=Broken Link Report&body=I found a broken link at: ${currentUrl}`;
    window.open(mailtoLink);
  }
}
