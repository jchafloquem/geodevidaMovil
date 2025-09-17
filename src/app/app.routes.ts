import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path:'mapa',
    loadComponent: () => import('./mapa/mapa.page').then((m) => m.MapaPage),
  },
  {
    path: '',
    redirectTo: 'mapa',
    pathMatch: 'full',
  },
  {
    path: 'polygon-modal',
    loadComponent: () => import('./mapa/polygon-modal/polygon-modal.page').then( m => m.PolygonModalPage)
  },

];
