
import { Component, inject } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="h-full bg-slate-900 flex flex-col p-4">
      <h1 class="text-2xl font-bold text-white mb-6 mt-2">Messaggi</h1>

      <!-- New Matches Horizontal Scroll -->
      <div class="mb-6">
        <h2 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Nuovi Match</h2>
        <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          @for (m of store.matches(); track m.user.id) {
            <div [routerLink]="['/chat', m.chatId]" class="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
              <div class="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-pink-500">
                <img [src]="m.user.photos[0]" class="w-full h-full rounded-full object-cover border-2 border-slate-900">
              </div>
              <span class="text-xs font-medium text-slate-300">{{m.user.name}}</span>
            </div>
          } @empty {
             <p class="text-slate-600 text-sm">Nessun match ancora. Vai a fare swipe!</p>
          }
        </div>
      </div>

      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto pb-28">
         <h2 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Conversazioni</h2>
         <div class="flex flex-col gap-2">
           @for (m of store.matches(); track m.user.id) {
             <div [routerLink]="['/chat', m.chatId]" class="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
               <img [src]="m.user.photos[0]" class="w-14 h-14 rounded-full object-cover">
               <div class="flex-1 min-w-0">
                 <div class="flex justify-between items-baseline mb-1">
                    <h3 class="font-bold text-white truncate">{{m.user.name}}</h3>
                    @if (m.unseenCount > 0) {
                      <span class="w-2 h-2 rounded-full bg-pink-500"></span>
                    }
                 </div>
                 <p class="text-sm text-slate-400 truncate">{{m.lastMessage}}</p>
               </div>
             </div>
           }
         </div>
      </div>
    </div>
  `
})
export class MatchesComponent {
  store = inject(StoreService);
}
