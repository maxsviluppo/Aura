
import { Injectable, signal, computed, effect } from '@angular/core';

export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'NB';
  bio: string;
  photos: string[];
  interests: string[];
  isVerified: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  type: 'text' | 'image' | 'system';
}

export interface Match {
  user: User;
  lastMessage?: string;
  compatibilityScore?: number;
  unseenCount: number;
  chatId: string;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  // Current User
  currentUser = signal<User | null>(null);

  // Global UI State
  activeProfile = signal<User | null>(null); // When set, triggers full screen mode

  // Candidates (Feed)
  candidates = signal<User[]>([]);

  // Matches
  matches = signal<Match[]>([]);

  // Chat History: Map chatId -> Message[]
  chats = signal<Record<string, Message[]>>({});

  constructor() {
    this.seedCandidates();
  }

  login(user: User) {
    this.currentUser.set(user);
  }

  updateVerification(status: boolean) {
    const u = this.currentUser();
    if (u) {
      this.currentUser.set({ ...u, isVerified: status });
    }
  }

  addPhoto(photoBase64: string) {
    this.currentUser.update(user => {
      if (!user) return null;
      // Limit to 9 photos
      if (user.photos.length >= 9) return user;
      return { ...user, photos: [...user.photos, photoBase64] };
    });
  }

  // Mock Data Generation
  private seedCandidates() {
    const mockUsers: User[] = Array.from({ length: 15 }).map((_, i) => ({
      id: `candidate-${i}`,
      name: ['Alice', 'Marco', 'Elena', 'Sofia', 'Luca', 'Giulia', 'Matteo', 'Chiara'][i % 8] + (i > 7 ? ' ' + i : ''),
      age: 20 + Math.floor(Math.random() * 15),
      gender: i % 2 === 0 ? 'F' : 'M',
      bio: [
        'Amo i viaggi e la cucina giapponese.',
        'Appassionato di tech e trekking.',
        'Cerco qualcuno con cui ridere.',
        'Fotografia e arte sono la mia vita.',
        'Startup founder, sempre di corsa.',
        'Fitness addict & dog lover.',
        'Musicista nel tempo libero.',
        'Pizza, Netflix e relax.'
      ][i % 8],
      photos: [
        `https://picsum.photos/seed/${i * 123}/400/600`,
        `https://picsum.photos/seed/${i * 123 + 1}/400/600`,
        `https://picsum.photos/seed/${i * 123 + 2}/400/600`,
      ],
      interests: [['Viaggi', 'Sushi'], ['Tech', 'Trekking'], ['Cinema', 'Vino'], ['Arte', 'Foto']][i % 4],
      isVerified: Math.random() > 0.5
    }));
    this.candidates.set(mockUsers);
  }

  likeUser(candidateId: string) {
    const candidate = this.candidates().find(c => c.id === candidateId);
    if (!candidate) return;

    // Simulate 40% match chance
    if (Math.random() > 0.4) {
      const chatId = `chat-${candidate.id}`;
      const newMatch: Match = {
        user: candidate,
        lastMessage: 'È un match! Saluta 👋',
        unseenCount: 1,
        chatId: chatId,
        compatibilityScore: Math.floor(Math.random() * 30) + 70 // 70-99%
      };
      this.matches.update(m => [newMatch, ...m]);
      
      // Init chat
      this.chats.update(c => ({
        ...c,
        [chatId]: [
          {
            id: 'sys-1',
            senderId: 'system',
            text: `Hai un match con ${candidate.name}!`,
            timestamp: Date.now(),
            type: 'system'
          }
        ]
      }));

      return true; // Is a match
    }
    return false; // Just a like
  }

  addMessage(chatId: string, message: Message) {
    this.chats.update(c => {
      const chatHistory = c[chatId] || [];
      return { ...c, [chatId]: [...chatHistory, message] };
    });

    // Update match last message preview
    this.matches.update(matches => matches.map(m => {
      if (m.chatId === chatId) {
        return { ...m, lastMessage: message.type === 'image' ? '📷 Foto' : message.text };
      }
      return m;
    }));
  }

  getMessages(chatId: string) {
    return computed(() => this.chats()[chatId] || []);
  }
}