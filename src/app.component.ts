
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { StoreService } from './services/store.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  store = inject(StoreService);
  router = inject(Router);

  get showNav() {
    return this.router.url !== '/onboarding' && !this.router.url.includes('/chat/');
  }
}
