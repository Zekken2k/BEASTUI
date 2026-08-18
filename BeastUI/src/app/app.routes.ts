import { Routes } from '@angular/router';

export const routes: Routes = [

{
    path: 'social-links',
    loadComponent: () => import('./components/social-links/social-links')
    .then(m => m.SocialLinks)
},
{
    path: 'portadas', // <-- NUEVA RUTA CONECTADA A TU MENÚ PRINCIPAL
    loadComponent: () => import('./components/covers/covers').then(m => m.Covers)
},
{
    path: 'diario-shido',
    loadComponent: () => import('./components/diario-shido/diario-shido').then(m => m.DiarioShido)
},
{
    path: 'diario-tohka',
    loadComponent: () => import('./components/diario-tohka/diario-tohka').then(m => m.DiarioTohka)
},
{
    path: 'banda-sonora',
    loadComponent: () => import('./components/music-player/music-player').then(m => m.MusicPlayer)
},
{
    path: 'angeles',
    loadComponent: () => import('./components/angels-compendium/angels-compendium').then(m => m.AngelsCompendium)
},
{
    path: 'sobre-mega',
    loadComponent: () => import('./components/author-profile/author-profile').then(m => m.AuthorProfile)
},
{
    path: 'encuesta',
    loadComponent: () => import('./components/fanfic-poll/fanfic-poll').then(m => m.FanficPoll)
},
{
    path: 'discord-oficial',
    loadComponent: () => import('./components/community-link/community-link').then(m => m.CommunityLink)
},
{
    path: '**',
    redirectTo: ''
}
];
