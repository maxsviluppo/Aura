
import { Component, inject, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService, Match } from '../../services/store.service';
import { AiService } from '../../services/ai.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="h-full flex flex-col bg-slate-950 relative">
      <!-- Header -->
      <header class="p-4 flex items-center gap-3 bg-slate-900 border-b border-white/5 z-20">
        <a routerLink="/matches" class="text-slate-400 hover:text-white">
          <span class="material-symbols-rounded text-3xl">arrow_back</span>
        </a>
        
        @if (match(); as m) {
          <div class="relative w-10 h-10">
             <img [src]="m.user.photos[0]" class="w-full h-full rounded-full object-cover">
             @if(m.user.isVerified) {
               <div class="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-[2px]">
                 <span class="material-symbols-rounded text-[10px] text-white block">check</span>
               </div>
             }
          </div>
          <div class="flex-1">
            <h1 class="font-bold text-white text-sm">{{m.user.name}}</h1>
            <p class="text-xs text-slate-400 flex items-center gap-1">
               <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
            </p>
          </div>
          <button (click)="openAiInsights()" class="bg-slate-800 p-2 rounded-full text-purple-400 border border-purple-500/30">
             <span class="material-symbols-rounded">psychology</span>
          </button>
        }
      </header>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4" #scrollContainer>
        @for (msg of messages(); track msg.id) {
          @if (msg.type === 'system') {
             <div class="text-center text-xs text-slate-500 my-2 bg-slate-900/50 py-1 rounded-full w-fit mx-auto px-4">{{msg.text}}</div>
          } @else {
             <div class="flex" [class.justify-end]="msg.senderId === 'me'">
                <div [class]="msg.senderId === 'me' 
                   ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl rounded-tr-sm' 
                   : 'bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm'" 
                   class="max-w-[75%] px-4 py-3 shadow-md text-sm">
                   {{msg.text}}
                   <div class="text-[10px] opacity-50 text-right mt-1">{{msg.timestamp | date:'HH:mm'}}</div>
                </div>
             </div>
          }
        }
        @if(isTyping()) {
          <div class="flex items-center gap-1 ml-2">
             <div class="w-2 h-2 rounded-full bg-slate-600 animate-bounce"></div>
             <div class="w-2 h-2 rounded-full bg-slate-600 animate-bounce delay-100"></div>
             <div class="w-2 h-2 rounded-full bg-slate-600 animate-bounce delay-200"></div>
          </div>
        }
      </div>

      <!-- Input -->
      <div class="p-3 bg-slate-900 border-t border-white/5 flex gap-2 items-end">
        <button class="p-3 text-slate-400 hover:text-white rounded-full transition-colors">
           <span class="material-symbols-rounded">add_photo_alternate</span>
        </button>
        <textarea 
          [(ngModel)]="newMessage" 
          (keydown.enter)="sendMessage($event)"
          placeholder="Scrivi un messaggio..." 
          rows="1"
          class="flex-1 bg-slate-800 text-white rounded-2xl px-4 py-3 max-h-32 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm resize-none"
        ></textarea>
        <button (click)="sendMessage()" [disabled]="!newMessage().trim() || isSending()" class="p-3 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
           @if (isSending()) {
             <span class="material-symbols-rounded animate-spin">refresh</span>
           } @else {
             <span class="material-symbols-rounded">send</span>
           }
        </button>
      </div>

      <!-- AI Modal -->
      @if (showAiModal()) {
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
           <div class="bg-slate-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-float">
             <button (click)="showAiModal.set(false)" class="absolute top-4 right-4 text-slate-400"><span class="material-symbols-rounded">close</span></button>
             
             <div class="flex flex-col items-center mb-6">
                <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                   <span class="material-symbols-rounded text-3xl text-white">auto_awesome</span>
                </div>
                <h2 class="text-xl font-bold text-white">Aura Insights</h2>
             </div>

             @if (aiLoading()) {
               <div class="text-center py-8">
                 <p class="text-slate-400 animate-pulse">Analisi vibrazioni cosmiche...</p>
               </div>
             } @else {
               <div class="space-y-4">
                  <div class="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <div class="text-xs text-slate-500 uppercase font-bold mb-1">Compatibilità</div>
                    <div class="text-3xl font-bold text-pink-400">{{aiResult()?.score}}%</div>
                  </div>
                  <div class="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <div class="text-xs text-slate-500 uppercase font-bold mb-1">Analisi</div>
                    <p class="text-sm text-slate-300 italic">"{{aiResult()?.analysis}}"</p>
                  </div>
                  <div class="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <div class="text-xs text-slate-500 uppercase font-bold mb-1">Suggerimento</div>
                    <p class="text-sm text-white">{{aiResult()?.iceBreaker}}</p>
                  </div>
               </div>
             }
           </div>
        </div>
      }
    </div>
  `
})
export class ChatDetailComponent {
  route = inject(ActivatedRoute);
  store = inject(StoreService);
  ai = inject(AiService);

  chatId = signal('');
  match = signal<Match | null>(null);
  newMessage = signal('');
  messages = signal<any[]>([]);
  isTyping = signal(false);
  isSending = signal(false);
  
  // AI State
  showAiModal = signal(false);
  aiLoading = signal(false);
  aiResult = signal<any>(null);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    this.route.params.subscribe(params => {
      this.chatId.set(params['id']);
      const m = this.store.matches().find(m => m.chatId === params['id']);
      if (m) this.match.set(m);
      
      effect(() => {
        const msgs = this.store.getMessages(this.chatId())();
        this.messages.set(msgs);
        setTimeout(() => this.scrollToBottom(), 50);
      });
    });
  }

  scrollToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  async sendMessage(event?: Event) {
    if (event) event.preventDefault();
    const text = this.newMessage().trim();
    if (!text || this.isSending()) return;

    this.isSending.set(true);

    // AI Moderation Step
    const isSafe = await this.ai.checkContentSafety(text);

    if (!isSafe) {
      alert("⚠️ Messaggio bloccato dal moderatore AI: Contenuto potenzialmente offensivo.");
      this.isSending.set(false);
      return;
    }

    // Add User Message
    this.store.addMessage(this.chatId(), {
      id: Date.now().toString(),
      senderId: 'me',
      text: text,
      timestamp: Date.now(),
      type: 'text'
    });
    this.newMessage.set('');
    this.isSending.set(false);

    // Simulate Reply
    setTimeout(() => this.isTyping.set(true), 1000);
    setTimeout(() => {
      this.isTyping.set(false);
      this.store.addMessage(this.chatId(), {
        id: (Date.now() + 1).toString(),
        senderId: 'them',
        text: 'Ahah, interessante! Raccontami di più.',
        timestamp: Date.now(),
        type: 'text'
      });
    }, 3000);
  }

  async openAiInsights() {
    this.showAiModal.set(true);
    if (!this.aiResult()) {
       this.aiLoading.set(true);
       const res = await this.ai.getCompatibilityAnalysis(
         this.store.currentUser(),
         this.match()?.user
       );
       this.aiResult.set(res);
       this.aiLoading.set(false);
    }
  }
}
