
import { Component, inject } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="h-full bg-slate-900 overflow-y-auto pb-32">
      @if (store.currentUser(); as user) {
        <!-- Header Image -->
        <div class="relative h-64 w-full">
           <img [src]="user.photos[0]" class="w-full h-full object-cover">
           <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
           <div class="absolute bottom-4 left-4">
             <h1 class="text-3xl font-bold text-white flex items-center gap-2">
               {{user.name}}, {{user.age}}
               @if (user.isVerified) {
                 <span class="material-symbols-rounded text-blue-500">verified</span>
               }
             </h1>
           </div>
        </div>

        <!-- Stats / Verification -->
        <div class="px-4 py-6">
           @if (!user.isVerified) {
             <div class="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between mb-6 shadow-lg relative overflow-hidden">
                <div class="relative z-10">
                  <h3 class="font-bold text-white mb-1">Verifica il profilo</h3>
                  <p class="text-xs text-slate-400">Ottieni il badge blu e +20% match</p>
                </div>
                <a routerLink="/verify" class="relative z-10 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                   Verifica
                </a>
                <!-- Decorative BG glow -->
                <div class="absolute right-0 top-0 w-32 h-32 bg-blue-600/20 blur-2xl rounded-full -mr-10 -mt-10"></div>
             </div>
           }

           <div class="grid grid-cols-3 gap-4 mb-8 text-center">
              <div class="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                <span class="block text-2xl font-bold text-white">0</span>
                <span class="text-[10px] text-slate-400 uppercase tracking-wider">Like</span>
              </div>
              <div class="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                <span class="block text-2xl font-bold text-pink-500">{{store.matches().length}}</span>
                <span class="text-[10px] text-slate-400 uppercase tracking-wider">Match</span>
              </div>
              <div class="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                 <span class="block text-2xl font-bold text-purple-500">85%</span>
                 <span class="text-[10px] text-slate-400 uppercase tracking-wider">Aura</span>
              </div>
           </div>

           <!-- Bio -->
           <div class="mb-8">
             <h3 class="text-sm font-bold text-slate-500 uppercase mb-2">Bio</h3>
             <p class="text-slate-200">{{user.bio}}</p>
           </div>

           <!-- Interests -->
           <div class="mb-8">
             <h3 class="text-sm font-bold text-slate-500 uppercase mb-2">Interessi</h3>
             <div class="flex flex-wrap gap-2">
               @for (int of user.interests; track int) {
                 <span class="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300 border border-slate-700">{{int}}</span>
               }
             </div>
           </div>

           <!-- Gallery Grid -->
           <div>
             <div class="flex justify-between items-end mb-3">
               <h3 class="text-sm font-bold text-slate-500 uppercase">Galleria</h3>
               <span class="text-xs text-slate-400">{{user.photos.length}} / 9</span>
             </div>
             
             <div class="grid grid-cols-3 gap-2">
               <!-- Add Button (Only if < 9) -->
               @if (user.photos.length < 9) {
                 <div (click)="fileInput.click()" class="aspect-square bg-slate-800 rounded-lg overflow-hidden relative group cursor-pointer border-2 border-dashed border-slate-700 hover:border-pink-500 transition-colors">
                    <div class="absolute inset-0 flex flex-col items-center justify-center bg-white/5 group-hover:bg-white/10 transition">
                       <span class="material-symbols-rounded text-slate-400 group-hover:text-pink-500">add_a_photo</span>
                       <span class="text-[10px] text-slate-500 mt-1">Aggiungi</span>
                    </div>
                 </div>
               }

               <!-- Photos -->
               @for (photo of user.photos; track photo) {
                 <div class="aspect-square rounded-lg overflow-hidden relative group">
                   <img [src]="photo" class="w-full h-full object-cover">
                   <!-- Gradient overlay for better look -->
                   <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                 </div>
               }
             </div>
             
             <!-- Hidden Input -->
             <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
           </div>
           
           <div class="mt-8 pt-8 border-t border-slate-800 text-center">
             <button class="text-red-500 text-sm font-medium">Logout</button>
           </div>
        </div>
      }
    </div>
  `
})
export class ProfileComponent {
  store = inject(StoreService);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validation: Check current length
      const currentCount = this.store.currentUser()?.photos.length || 0;
      if (currentCount >= 9) {
        alert('Hai raggiunto il limite massimo di 9 foto.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.store.addPhoto(result);
        }
      };
      reader.readAsDataURL(file);
      
      // Reset input value to allow selecting the same file again if needed
      input.value = '';
    }
  }
}
