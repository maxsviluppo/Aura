
import { Component, inject, signal, computed, OnDestroy, effect } from '@angular/core';
import { StoreService, User } from '../../services/store.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      padding-bottom: 6rem; /* Space for nav */
    }
    
    /* Animations */
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes swipeRight {
      0% { transform: translateX(0) rotate(0) scale(1); opacity: 1; }
      100% { transform: translateX(150%) rotate(25deg) scale(0.8); opacity: 0; }
    }

    @keyframes swipeLeft {
      0% { transform: translateX(0) rotate(0) scale(1); opacity: 1; }
      100% { transform: translateX(-150%) rotate(-25deg) scale(0.8); opacity: 0; }
    }

    .animate-slide-up {
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-swipe-right {
      animation: swipeRight 0.5s ease-in forwards;
    }
    .animate-swipe-left {
      animation: swipeLeft 0.5s ease-in forwards;
    }
  `],
  template: `
    <div class="h-full w-full relative bg-slate-900 flex flex-col">
      <!-- Top Bar -->
      <div class="px-4 py-3 flex justify-between items-center z-10 shrink-0 bg-slate-900/90 backdrop-blur-sm sticky top-0">
        <div>
          <h1 class="text-2xl font-bold gradient-text tracking-tight">Esplora</h1>
          <p class="text-xs text-slate-400">Persone nelle vicinanze</p>
        </div>
        
        <!-- View Toggle -->
        <div class="flex bg-slate-800 rounded-xl p-1 gap-1 border border-white/10">
           <button (click)="viewMode.set('swipe')" [class.bg-slate-700]="viewMode() === 'swipe'" [class.text-pink-400]="viewMode() === 'swipe'" class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 transition-all">
             <span class="material-symbols-rounded">style</span>
           </button>
           <button (click)="viewMode.set('grid')" [class.bg-slate-700]="viewMode() === 'grid'" [class.text-pink-400]="viewMode() === 'grid'" class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 transition-all">
             <span class="material-symbols-rounded">grid_view</span>
           </button>
        </div>
      </div>

      <!-- MAIN CONTENT AREA -->
      <div class="flex-1 overflow-hidden relative">
        
        <!-- === SWIPE VIEW === -->
        @if (viewMode() === 'swipe') {
          <div class="h-full w-full flex flex-col items-center justify-center p-4 pb-24 relative">
             @if (topCandidate(); as candidate) {
               <!-- Background Stack Effect -->
               <div class="absolute w-[90%] h-[60%] bg-slate-800/50 rounded-3xl top-[8%] scale-90 opacity-50 -z-10"></div>
               <div class="absolute w-[92%] h-[60%] bg-slate-800/80 rounded-3xl top-[6%] scale-95 opacity-70 -z-10"></div>

               <!-- Active Card -->
               <div 
                 class="w-full h-full max-h-[600px] relative rounded-3xl overflow-hidden bg-slate-800 shadow-2xl border border-white/10 transform transition-transform will-change-transform"
                 [class.animate-swipe-right]="exitAnim() === 'like'"
                 [class.animate-swipe-left]="exitAnim() === 'pass'"
               >
                 <!-- Image -->
                 <img [src]="candidate.photos[0]" class="w-full h-full object-cover pointer-events-none">
                 
                 <!-- Gradient & Info -->
                 <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <div class="flex justify-between items-end mb-2">
                       <div>
                         <h2 class="text-3xl font-bold text-white flex items-center gap-2">
                           {{candidate.name}}, {{candidate.age}}
                           @if (candidate.isVerified) {
                             <span class="material-symbols-rounded text-blue-400 text-xl">verified</span>
                           }
                         </h2>
                         <p class="text-slate-300 line-clamp-2 mt-2 opacity-90">{{candidate.bio}}</p>
                       </div>
                       <div class="px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur text-white text-sm font-bold shrink-0">
                          {{getCompatibility(candidate)}}% Aura
                       </div>
                    </div>

                    <!-- Tags -->
                    <div class="flex flex-wrap gap-2 mb-4">
                       @for (tag of candidate.interests.slice(0, 3); track tag) {
                         <span class="px-3 py-1 rounded-full bg-black/40 backdrop-blur text-xs text-white border border-white/10">{{tag}}</span>
                       }
                    </div>
                 </div>

                 <!-- Tap Zones for simple photo nav (optional, future feature) -->
                 <div class="absolute inset-0 flex">
                    <div (click)="openProfile(candidate)" class="flex-1"></div>
                 </div>
               </div>

               <!-- Floating Action Buttons -->
               <div class="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-20">
                  <button (click)="passCandidate(candidate)" class="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 text-red-500 shadow-xl flex items-center justify-center hover:scale-110 hover:bg-red-500 hover:text-white transition-all duration-300">
                    <span class="material-symbols-rounded text-4xl">close</span>
                  </button>
                  
                  <button (click)="openProfile(candidate)" class="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center hover:scale-110 hover:text-white transition-all">
                    <span class="material-symbols-rounded text-2xl">info</span>
                  </button>

                  <button (click)="likeCandidate(candidate)" class="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 text-green-500 shadow-xl flex items-center justify-center hover:scale-110 hover:bg-green-500 hover:text-white transition-all duration-300">
                    <span class="material-symbols-rounded text-4xl">favorite</span>
                  </button>
               </div>

             } @else {
               <!-- Empty State -->
               <div class="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                 <div class="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                   <span class="material-symbols-rounded text-4xl text-slate-500">radar</span>
                 </div>
                 <h3 class="text-xl font-bold text-white mb-2">Nessun altro profilo</h3>
                 <p class="text-slate-400">Hai visto tutti in zona. Torna più tardi!</p>
               </div>
             }
          </div>
        }

        <!-- === GRID VIEW === -->
        @if (viewMode() === 'grid') {
          <div class="h-full overflow-y-auto hide-scrollbar p-3">
            <div class="gallery-grid">
              @for (candidate of store.candidates(); track candidate.id) {
                <div (click)="openProfile(candidate)" class="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800 cursor-pointer active:scale-95 transition-transform duration-200">
                   <img [src]="candidate.photos[0]" class="w-full h-full object-cover">
                   
                   <!-- Gradient Overlay -->
                   <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                   
                   <!-- Short Details -->
                   <div class="absolute bottom-3 left-3 right-3">
                      <h3 class="text-white font-bold text-lg flex items-center gap-1">
                        {{candidate.name}}, {{candidate.age}}
                        @if (candidate.isVerified) {
                          <span class="material-symbols-rounded text-blue-400 text-sm">verified</span>
                        }
                      </h3>
                      <!-- First Interest Tag -->
                      <div class="flex items-center gap-1 mt-1">
                        <span class="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-[10px] text-white font-medium border border-white/10">
                          {{candidate.interests[0]}}
                        </span>
                        @if(candidate.interests.length > 1) {
                           <span class="text-[10px] text-slate-300">+{{candidate.interests.length - 1}}</span>
                        }
                      </div>
                   </div>
                </div>
              } @empty {
                <div class="col-span-2 text-center py-20 text-slate-500">
                   <p>Nessun profilo trovato al momento.</p>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Detail Modal Overlay (Shared logic for both views) -->
      @if (store.activeProfile(); as candidate) {
        <div 
           class="fixed inset-0 z-40 bg-black/95 flex flex-col transform origin-center"
           [class.animate-slide-up]="exitAnim() === 'none'"
           [class.animate-swipe-right]="exitAnim() === 'like'"
           [class.animate-swipe-left]="exitAnim() === 'pass'"
        >
           
           <!-- Photo Carousel -->
           <div class="relative h-[65%] shrink-0 w-full bg-slate-800">
              <img [src]="candidate.photos[photoIndex()]" class="w-full h-full object-cover">
              
              <!-- Navigation Tap Areas -->
              <div class="absolute inset-0 flex">
                 <div (click)="prevPhoto($event)" class="w-1/2 h-full z-10"></div>
                 <div (click)="nextPhoto($event, candidate.photos.length)" class="w-1/2 h-full z-10"></div>
              </div>

              <!-- Indicators -->
              <div class="absolute top-4 left-0 right-0 flex justify-center gap-1 z-20 px-4 pointer-events-none">
               @for (p of candidate.photos; track $index) {
                 <div class="h-1 flex-1 rounded-full bg-white/30 backdrop-blur-md overflow-hidden">
                   <div [class.bg-white]="photoIndex() >= $index" class="h-full w-full transition-colors duration-300"></div>
                 </div>
               }
             </div>
           </div>

           <!-- Details & Actions -->
           <div class="flex-1 bg-slate-900 p-6 flex flex-col relative -mt-6 rounded-t-3xl border-t border-white/10">
              <div class="flex-1 overflow-y-auto mb-4 hide-scrollbar">
                 <div class="flex justify-between items-start mb-2">
                   <div>
                     <h2 class="text-3xl font-bold text-white">{{candidate.name}}, {{candidate.age}}</h2>
                     <p class="text-slate-400 text-sm">📍 5 km da te</p>
                   </div>
                   <div class="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-pink-500/30 text-pink-400 font-bold text-sm">
                     {{getCompatibility(candidate)}}% Aura
                   </div>
                 </div>

                 <p class="text-slate-300 my-4 leading-relaxed">{{candidate.bio}}</p>

                 <div class="flex flex-wrap gap-2">
                    @for (tag of candidate.interests; track tag) {
                      <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm">{{tag}}</span>
                    }
                 </div>
              </div>

              <!-- Action Buttons (Modal Version) -->
              <div class="flex gap-4 justify-center pt-2">
                 <button (click)="passCandidate(candidate)" class="flex-1 bg-slate-800 text-white font-bold py-4 rounded-2xl border border-slate-700 hover:bg-slate-700 transition active:scale-95">
                    Pass
                 </button>
                 <button (click)="likeCandidate(candidate)" class="flex-[2] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-900/30 hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <span class="material-symbols-rounded">favorite</span> Like
                 </button>
              </div>
           </div>
        </div>
      }
      
      <!-- Match Animation Overlay -->
      @if (matchAnimation()) {
        <div class="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
           <div class="flex flex-col items-center w-full max-w-sm">
             <h2 class="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-8 font-script drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] transform -rotate-6">It's a Match!</h2>
             
             <div class="flex items-center justify-center gap-6 mb-10 relative">
                <div class="relative">
                   <div class="absolute inset-0 bg-purple-500 blur-xl opacity-50 animate-pulse"></div>
                   <img [src]="store.currentUser()?.photos?.[0]" class="w-28 h-28 rounded-full border-4 border-purple-500 relative z-10 object-cover">
                </div>
                <div class="w-12 h-12 rounded-full bg-white text-pink-500 flex items-center justify-center font-bold text-xl absolute z-20 shadow-lg">
                  <span class="material-symbols-rounded">favorite</span>
                </div>
                <div class="relative">
                   <div class="absolute inset-0 bg-pink-500 blur-xl opacity-50 animate-pulse delay-75"></div>
                   <img [src]="matchedUser()?.photos?.[0]" class="w-28 h-28 rounded-full border-4 border-pink-500 relative z-10 object-cover">
                </div>
             </div>

             <p class="text-center text-slate-300 mb-10 text-lg">Tu e <span class="text-white font-bold">{{matchedUser()?.name}}</span> vi piacete!</p>
             
             <div class="flex flex-col gap-3 w-full">
               <button [routerLink]="['/chat', matchChatId()]" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-900/40 hover:scale-105 transition">
                 Invia Messaggio
               </button>
               <button (click)="closeMatch()" class="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-700 transition">
                 Torna alla Gallery
               </button>
             </div>
           </div>
        </div>
      }
    </div>
  `
})
export class HomeComponent implements OnDestroy {
  store = inject(StoreService);
  
  viewMode = signal<'swipe' | 'grid'>('swipe');
  
  // Computes the first candidate for Swipe Mode
  topCandidate = computed(() => {
    const list = this.store.candidates();
    return list.length > 0 ? list[0] : null;
  });

  photoIndex = signal(0);
  exitAnim = signal<'none' | 'like' | 'pass'>('none');
  
  // State for Match
  matchAnimation = signal(false);
  matchedUser = signal<User | null>(null);

  matchChatId = computed(() => {
    const user = this.matchedUser();
    return user ? `chat-${user.id}` : '';
  });

  constructor() {
    // Reset animation state when profile changes/closes
    effect(() => {
      if (!this.store.activeProfile()) {
        this.exitAnim.set('none');
      }
    });
  }

  getCompatibility(candidate: User) {
    return 75 + (candidate.id.length || 0); // Simulated Score
  }

  // --- Grid Interaction ---
  openProfile(candidate: User) {
    this.photoIndex.set(0);
    this.exitAnim.set('none');
    this.store.activeProfile.set(candidate);
  }

  // --- Photo Navigation (Modal) ---
  nextPhoto(e: Event, total: number) {
    e.stopPropagation();
    if (this.photoIndex() < total - 1) this.photoIndex.update(i => i + 1);
  }

  prevPhoto(e: Event) {
    e.stopPropagation();
    if (this.photoIndex() > 0) this.photoIndex.update(i => i - 1);
  }

  // --- Actions ---
  
  removeCandidate(id: string) {
    this.store.candidates.update(list => list.filter(c => c.id !== id));
  }
  
  passCandidate(candidate?: User) {
    // Use passed candidate (Swipe) or active profile (Modal)
    const target = candidate || this.store.activeProfile();
    if (!target) return;

    this.exitAnim.set('pass');
    
    setTimeout(() => {
      this.store.activeProfile.set(null); // Close modal if open
      this.removeCandidate(target.id); // Remove from list
      this.exitAnim.set('none'); // Reset animation for next
    }, 400); 
  }

  likeCandidate(candidate?: User) {
    const target = candidate || this.store.activeProfile();
    if (!target) return;

    this.exitAnim.set('like');
    
    setTimeout(() => {
      const isMatch = this.store.likeUser(target.id);
      
      this.store.activeProfile.set(null); // Close modal
      this.removeCandidate(target.id); // Remove from list
      this.exitAnim.set('none');

      if (isMatch) {
        // Delay match screen slightly
        setTimeout(() => {
          this.matchedUser.set(target);
          this.matchAnimation.set(true);
        }, 100);
      }
    }, 400); 
  }

  closeMatch() {
    this.matchAnimation.set(false);
    this.matchedUser.set(null);
  }
  
  ngOnDestroy() {
    this.store.activeProfile.set(null);
  }
}
