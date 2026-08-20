import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Audio } from './services/audio';
import { Data } from './services/data'; 
import { trigger, transition, style, query, animate, group } from '@angular/animations';

interface MenuItem {
  name: string;
  desc: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'], // <-- CORREGIDO: Se inyectó la coma obligatoria de Angular
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        // 1. CAPTURAMOS LAS PANTALLAS EN CAPAS ABSOLUTAS DE ALTA FIDELIDAD
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            boxSizing: 'border-box',
            zIndex: 1
          })
        ], { optional: true }),
        
        // 2. EL ARRANQUE DE LA OLA: La nueva pantalla arranca lista a la derecha
        query(':enter', [
          style({ 
            transform: 'translateX(100vw) skewX(-20deg) scaleX(0.85)', 
            filter: 'blur(4px)',
            opacity: 0,
            zIndex: 2 
          })
        ], { optional: true }),

        group([
          // 3. LA HOJA DE SALIDA: El menú viejo se dobla hacia la izquierda
          query(':leave', [
            animate('0.42s cubic-bezier(0.45, 0, 0.55, 1)', 
              style({ 
                transform: 'translateX(-100vw) skewX(20deg) scaleX(0.85)', 
                filter: 'blur(12px) brightness(0.4)',
                opacity: 0 
              })
            )
          ], { optional: true }),

          // 4. EL VAIVÉN DE OCÉANO ENTRANTE: La nueva pantalla se acomoda elásticamente
          query(':enter', [
            animate('0.55s cubic-bezier(0.25, 1, 0.5, 1)', 
              style({ 
                transform: 'translateX(0) skewX(0) scaleX(1)', 
                filter: 'blur(0)',
                opacity: 1 
              })
            )
          ], { optional: true })
        ])
      ])
    ])
  ]


})
export class App implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  currentIndex: number = 0;
  clockText: string = '00:00';
  isMainMenuActive: boolean = true;
   isSectionLockedAlert: boolean = false;
  
  // CONTROL DE ENTRADA WEB
  showSplashScreen: boolean = (typeof window !== 'undefined') 
    ? !sessionStorage.getItem('beastui_welcome_done') 
    : true;
  
  private clockInterval: any;
  private curveX: number[] = [0, 1.5, 2.8, 3.6, 3.8, 3.2, 1.8, -0.5, -3.5];

  constructor(
    private audio: Audio,
    public router: Router, // <-- OPTIMIZADO: Cambiado a public para lectura nativa de app.html
    private data: Data,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isMainMenuActive = (event.url === '/' || event.url === '');
    });
  }

  ngOnInit(): void {
    this.startClock();
    this.loadDatabaseMenu();
    this.cdr.detectChanges();
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: Event): void {
    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('Ruta detectada en el retroceso del navegador:', this.router.url);
    }, 50);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  // --- ESCUCHA UNIVERSAL PARA DESBLOQUEAR EL INTEGRAL DE AUDIO ---
  @HostListener('window:keydown', ['$event'])
  @HostListener('window:click', ['$event'])
  initialUserInteraction(event: Event): void {
    if (this.showSplashScreen) {
      if (event instanceof KeyboardEvent) event.preventDefault();
      
      this.unlockBrowserAudio(); // Desbloquea el AudioContext nativo
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('beastui_welcome_done', 'true');
      }

      this.showSplashScreen = false; 
      this.isMainMenuActive = true;  
      this.cdr.detectChanges(); 
    }
  }

  private loadDatabaseMenu(): void {
    this.data.getMenuOptions().subscribe({
      next: (data) => {
        this.menuItems = data.map(item => ({
          name: item.name,
          desc: item.description
        }));
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error cargando el menú de HeidiSQL:', err)
    });
  }

  private startClock(): void {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.clockText = `${hours}:${minutes}`;
    };
    updateTime();
    this.clockInterval = setInterval(updateTime, 1000);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.showSplashScreen || !this.isMainMenuActive) return;

    if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
      this.changeSelection(1);
    } else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      this.changeSelection(-1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.confirmSelection();
    }
  }

  changeSelection(offset: number): void {
    this.currentIndex = (this.currentIndex + offset + this.menuItems.length) % this.menuItems.length;
    this.audio.playMenuSound('move');
  }

  onMouseEnter(index: number): void {
    if (this.showSplashScreen || !this.isMainMenuActive) return;
    if (index !== this.currentIndex) {
      this.currentIndex = index;
      this.audio.playMenuSound('move'); 
    }
  }

  async confirmSelection(): Promise<void> {
    this.audio.playMenuSound('confirm');
    const activeItem = this.menuItems[this.currentIndex]?.name?.toUpperCase().trim();

    if (activeItem === 'SOCIAL LINK') {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/social-links']);
    } 
    else if (activeItem === 'PORTADAS') {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/portadas']);
    } 
    else if (activeItem === 'DIARIO DE SHIDO') {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/diario-shido']);
    }
        // --- REEMPLAZA LA CONDICIÓN DE TOHKA POR ESTA COMPUERTA INTELIGENTE ---
    else if (activeItem.includes('TOHKA')) {
      this.audio.playMenuSound('move'); // Alerta de tope oficial
      this.isSectionLockedAlert = true; // Encendemos el cartel en el HTML
      this.cdr.detectChanges();

      setTimeout(() => {
        this.isSectionLockedAlert = false;
        this.cdr.detectChanges();
      }, 2500);
    }


    else if (activeItem === 'ÁNGELES') {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/angeles']);
    }
    else if (activeItem === 'SOBRE MEGA') { 
      await new Promise(resolve => setTimeout(resolve, 300)); 
      this.router.navigate(['/sobre-mega']); 
    }
    else if (activeItem === 'BANDA SONORA') { 
      await new Promise(resolve => setTimeout(resolve, 300)); 
      this.router.navigate(['/banda-sonora']); 
    }
    else if (activeItem === 'ENCUESTA') { 
      await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/encuesta']); 
    }
    else if (activeItem === 'DISCORD OFICIAL') { 
      await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/discord-oficial']); 
    }
    else {
      console.log('Confirmado desde el archivo app principal:', activeItem);
    }
  }

    prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  // RECONSTRUIDO: Restauramos tu ecuación de curva elástica matemática que se había cortado
  getTransform(index: number): string {
    let x = this.curveX[index] || 0;
    let scale = 1 - (index * 0.045);
    let rotate = -13;
    return `skewX(${rotate}deg) scale(${scale}) translateX(${x}vw)`;
  }

  // Método auxiliar por seguridad para evitar colapsos al iniciar el audio
  private unlockBrowserAudio(): void {
    if (this.audio && typeof (this.audio as any).unlock === 'function') {
      (this.audio as any).unlock();
    }
  }
}
