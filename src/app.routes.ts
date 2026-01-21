
import { Routes } from '@angular/router';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { HomeComponent } from './components/home/home.component';
import { MatchesComponent } from './components/matches/matches.component';
import { ChatDetailComponent } from './components/chat/chat-detail.component';
import { ProfileComponent } from './components/profile/profile.component';
import { VerificationComponent } from './components/verification/verification.component';

export const routes: Routes = [
  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'home', component: HomeComponent },
  { path: 'matches', component: MatchesComponent },
  { path: 'chat/:id', component: ChatDetailComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'verify', component: VerificationComponent }
];
