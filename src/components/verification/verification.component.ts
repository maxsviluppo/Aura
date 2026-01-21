
import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { AiService } from '../../services/ai.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full bg-black flex flex-col relative">
       <!-- Camera View -->
       <div class="flex-1 relative overflow-hidden bg-slate-900">
         @if (!capturedImage()) {
            <video #video autoplay playsinline class="w-full h-full object-cover mirror"></video>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-64 h-80 border-2 border-white/30 rounded-full box-shadow-overlay"></div>
            </div>
            <div class="absolute top-8 w-full text-center">
              <span class="bg-black/50 px-4 py-2 rounded-full text-white text-sm backdrop-blur">Inquadra il tuo volto</span>
            </div>
         } @else {
            <img [src]="capturedImage()" class="w-full h-full object-cover">
         }
       </div>

       <!-- Controls -->
       <div class="h-32 bg-slate-900 flex items-center justify-center gap-8 relative z-10">
         @if (!capturedImage()) {
            <button (click)="cancel()" class="text-white p-4">Annulla</button>
            <button (click)="capture()" class="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
              <div class="w-14 h-14 bg-white rounded-full"></div>
            </button>
            <div class="w-16"></div> <!-- Spacer -->
         } @else {
            @if (isAnalyzing()) {
               <div class="flex flex-col items-center gap-2">
                 <span class="material-symbols-rounded animate-spin text-3xl text-pink-500">sync</span>
                 <p class="text-xs text-slate-400">Verifica in corso...</p>
               </div>
            } @else {
               <button (click)="retake()" class="bg-slate-800 text-white px-6 py-3 rounded-full">Riprova</button>
               <button (click)="confirm()" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-pink-900/30">
                 Conferma
               </button>
            }
         }
       </div>
       <canvas #canvas class="hidden"></canvas>
    </div>
  `,
  styles: [`
    .mirror { transform: scaleX(-1); }
    .box-shadow-overlay { box-shadow: 0 0 0 999px rgba(0,0,0,0.7); }
  `]
})
export class VerificationComponent {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  router = inject(Router);
  store = inject(StoreService);
  ai = inject(AiService);

  capturedImage = signal<string | null>(null);
  isAnalyzing = signal(false);
  stream: MediaStream | null = null;

  async ngAfterViewInit() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }
    } catch (e) {
      console.error('Camera error', e);
      alert('Impossibile accedere alla fotocamera.');
      this.router.navigate(['/profile']);
    }
  }

  ngOnDestroy() {
    this.stream?.getTracks().forEach(track => track.stop());
  }

  capture() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    this.capturedImage.set(canvas.toDataURL('image/jpeg'));
  }

  retake() {
    this.capturedImage.set(null);
  }

  async confirm() {
    if (!this.capturedImage()) return;
    this.isAnalyzing.set(true);
    
    // Simulate slight delay for "AI thinking" + actual check
    const isValid = await this.ai.verifyIdentity(this.capturedImage()!);
    
    this.isAnalyzing.set(false);
    
    if (isValid) {
      this.store.updateVerification(true);
      alert('Identità Verificata con Successo! ✅');
      this.router.navigate(['/profile']);
    } else {
      alert('Verifica fallita. Volto non rilevato chiaramente.');
      this.retake();
    }
  }

  cancel() {
    this.router.navigate(['/profile']);
  }
}
