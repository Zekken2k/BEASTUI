import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';

export const routes: Routes = [
  {
    path: 'social-links',
    loadComponent: () => import('./components/social-links/social-links')
      .then(m => m.SocialLinks),
    data: { animation: 'SocialPage' } // <-- INYECTADO
  },
  {
    path: 'portadas',
    loadComponent: () => import('./components/covers/covers')
      .then(m => m.Covers),
    data: { animation: 'CoversPage' } // <-- INYECTADO
  },
  {
    path: 'diario-shido',
    loadComponent: () => import('./components/diario-shido/diario-shido')
      .then(m => m.DiarioShido),
    data: { animation: 'ShidoPage' } // <-- INYECTADO
  },
  {
    path: 'diario-tohka',
    loadComponent: () => import('./components/diario-tohka/diario-tohka')
      .then(m => m.DiarioTohka),
    data: { animation: 'TohkaPage' },
    
    // EL GUARDIÁN DE RATATOSKR NATIVO: Bloquea la URL usando el inyector moderno de Angular
    canActivate: [() => {
      inject(Router).navigate(['/']); 
      return false; // Bloqueo absoluto de renderizado
    }]
  },
  {
    path: 'banda-sonora',
    loadComponent: () => import('./components/music-player/music-player')
      .then(m => m.MusicPlayer),
    data: { animation: 'MusicPage' } // <-- INYECTADO
  },
  {
    path: 'angeles',
    loadComponent: () => import('./components/angels-compendium/angels-compendium')
      .then(m => m.AngelsCompendium),
    data: { animation: 'AngelsPage' } // <-- INYECTADO
  },
  {
    path: 'sobre-mega',
    loadComponent: () => import('./components/author-profile/author-profile')
      .then(m => m.AuthorProfile),
    data: { animation: 'AuthorPage' } // <-- INYECTADO
  },
  {
    path: 'encuesta',
    loadComponent: () => import('./components/fanfic-poll/fanfic-poll')
      .then(m => m.FanficPoll),
    data: { animation: 'PollPage' } // <-- INYECTADO
  },
  {
    path: 'discord-oficial',
    loadComponent: () => import('./components/community-link/community-link')
      .then(m => m.CommunityLink),
    data: { animation: 'DiscordPage' } // <-- INYECTADO
  },
  {
    path: '**',
    redirectTo: ''
  }
];
