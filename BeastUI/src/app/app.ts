import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Audio } from './services/audio';
import { Data } from './services/data'; 

interface MenuItem {
  name: string;
  desc: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  currentIndex: number = 0;
  clockText: string = '00:00';
  isMainMenuActive: boolean = true;
  
  // CONTROL DE ENTRADA WEB
showSplashScreen: boolean = (typeof window !== 'undefined') 
  ? !sessionStorage.getItem('beastui_welcome_done') 
  : true;
  private clockInterval: any;
  private curveX: number[] = [0, 1.5, 2.8, 3.6, 3.8, 3.2, 1.8, -0.5, -3.5];

  constructor(
    private audio: Audio,
    private router: Router,
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
    // 1. Forzamos un micro-retraso de 50 milisegundos para dejar que la URL cambie de forma limpia en el navegador
    setTimeout(() => {
      // 2. LA ORDEN DE ORO: Obliga a Angular a despertarse por software y redibujar el abanico morado en el acto
      this.cdr.detectChanges();
      
      // 3. Opcional: Si manejas música o efectos de movimiento, puedes reaccionar aquí
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
      
      // Guardamos la bandera en el navegador para que sepa que ya pasamos la bienvenida
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('beastui_welcome_done', 'true');
      }

      // --- CORRECCIÓN INTEGRAL DE EMBARQUE MULTIPLATAFORMA ---
      this.showSplashScreen = false; // Levantamos la cortina del Splash Screen
      this.isMainMenuActive = true;  // <-- ¡ESTA LÍNEA ES EL MANDAMIENTO QUE RESCATA TU MENÚ EN EL CELULAR!
      
      this.cdr.detectChanges(); // Forzamos a Angular a pintar la pantalla móvil al vuelo
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

  // Captura de teclado para mover el abanico (solo si la cortina ya se quitó)
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
      this.audio.playMenuSound('move'); // Sonará al instante porque el canal ya fue desbloqueado
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
    // --- REDIRECCIÓN ASÍNCRONA PARA EL DIARIO DE SHIDO ---
    else if (activeItem === 'DIARIO DE SHIDO') {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/diario-shido']);
    }
    // --- PREPARACIÓN PARA EL DIARIO DE TOHKA ---
    else if (activeItem === 'DIARIO DE TOHKA') {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/diario-tohka']);
    }
      else if (activeItem === 'ÁNGELES') {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/angeles']);
    }
    else if (activeItem === 'SOBRE MEGA') { await new Promise(resolve => setTimeout(resolve, 300)); 
      this.router.navigate(['/sobre-mega']); }
    else if (activeItem === 'BANDA SONORA') { 
      await new Promise(resolve => setTimeout(resolve, 300)); 
      this.router.navigate(['/banda-sonora']); }
      else if (activeItem === 'ENCUESTA') { await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/encuesta']); }
      else if (activeItem === 'DISCORD OFICIAL') { await new Promise(resolve => setTimeout(resolve, 300));
      this.router.navigate(['/discord-oficial']); }
    else {
      console.log('Confirmado desde el archivo app principal:', activeItem);
    }
  }


  getTransform(index: number): string {
    let x = this.curveX[index] || 0;
    let scale = 1 - (index * 0.045);
    let rotate = -13;
    let y = 0;

    if (index === this.currentIndex) {
      x = x - 3.5;
      scale = scale * 1.15;
      rotate = -14;
    } else if (index < this.currentIndex) {
      y = -1.2;
    } else if (index > this.currentIndex) {
      y = 1.2;
    }

    return `translate(${x}vw, ${y}vh) scale(${scale}) rotate(${rotate}deg)`;
  }

  private unlockBrowserAudio(): void {
    if (typeof window !== 'undefined' && (this.audio as any).audioCtx?.state === 'suspended') {
      (this.audio as any).audioCtx.resume();
    }
    this.audio.playMenuSound('confirm'); // Disparamos la confirmación de entrada
  }
}
