
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService, User } from '../../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="h-full w-full flex flex-col items-center justify-center p-8 bg-[url('https://images.unsplash.com/photo-1517480447814-63303c7336f3?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center relative">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <div class="relative z-10 w-full flex flex-col gap-6">
        <div class="text-center mb-4">
          <h1 class="text-5xl font-bold tracking-tighter mb-2"><span class="gradient-text">Aura</span></h1>
          <p class="text-slate-300">Dove l'AI incontra il cuore.</p>
        </div>

        @if (step() === 1) {
          <div class="bg-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-xl animate-float">
            <h2 class="text-xl font-bold mb-4 text-white">Chi sei?</h2>
            <input [(ngModel)]="name" type="text" placeholder="Il tuo nome" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-pink-500 transition-colors">
            
            <div class="flex gap-2 mb-4">
              <button (click)="gender.set('M')" [class.bg-pink-600]="gender() === 'M'" class="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition">Uomo</button>
              <button (click)="gender.set('F')" [class.bg-pink-600]="gender() === 'F'" class="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition">Donna</button>
            </div>

            <button (click)="nextStep()" [disabled]="!name()" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-900/20 disabled:opacity-50">
              Continua
            </button>
          </div>
        }

        @if (step() === 2) {
          <div class="bg-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-xl">
             <h2 class="text-xl font-bold mb-4 text-white">Cosa ti piace?</h2>
             <textarea [(ngModel)]="bio" placeholder="Descriviti in breve..." rows="3" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-pink-500 transition-colors"></textarea>
             
             <button (click)="complete()" class="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-100 transition">
               Entra in Aura
             </button>
          </div>
        }
      </div>
      
      <div class="absolute bottom-8 text-center w-full z-10">
        <p class="text-xs text-slate-500">Accesso Guest Attivo • ID: {{tempId}}</p>
      </div>
    </div>
  `
})
export class OnboardingComponent {
  router = inject(Router);
  store = inject(StoreService);

  step = signal(1);
  name = signal('');
  gender = signal<'M'|'F'|'NB'>('M');
  bio = signal('');
  tempId = Math.random().toString(36).substr(2, 9);

  nextStep() {
    if (this.name()) this.step.set(2);
  }

  complete() {
    const user: User = {
      id: this.tempId,
      name: this.name(),
      age: 25,
      gender: this.gender(),
      bio: this.bio() || 'Nuovo su Aura ✨',
      photos: ['https://picsum.photos/400/600'],
      interests: ['AI', 'Tech'],
      isVerified: false
    };
    this.store.login(user);
    this.router.navigate(['/home']);
  }
}
