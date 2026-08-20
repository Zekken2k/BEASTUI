import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Audio } from '../../services/audio';
import { Data } from '../../services/data';

interface ShidoEntry {
  arcoNum: string;
  arcoTitle: string;
  title: string;
  text: string;
  order: number;
  // NUEVA PROPIEDAD: Bolsa de páginas picadas por el separador [CORTE]
  pages: string[]; 
}

@Component({
  selector: 'app-diario-shido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diario-shido.html',
  styleUrls: ['./diario-shido.css']
})
export class DiarioShido implements OnInit {
  entries: ShidoEntry[] = [];
  currentIndex: number = 0;
  isReading: boolean = false; // Controla si se abre la caja expansiva para leer
  bgImageUrl: string = ''; 
  
  // --- CONTROLADOR DEL CARRUSEL DE LECTURA ---
  currentPage: number = 0; // Monitorea en qué sub-capítulo o página va el lector

  constructor(
    private audio: Audio,
    private router: Router,
    private data: Data,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDatabaseDiaries();
  }

  // --- CONSULTA ASÍNCRONA REAL A TU NUEVA TABLA EN HEIDISQL ---
  private loadDatabaseDiaries(): void {
    if ((this.data as any).getShidoDiary) {
      (this.data as any).getShidoDiary().subscribe({
        next: (data: any[]) => {
          // MAPEO DINÁMICO: Convertimos el texto plano en páginas por sub-capítulos
          this.entries = data.map((item: any) => {
            let choppedPages: string[] = [];
            
            // Si el texto de HeidiSQL contiene el letrero [CORTE], lo dividimos en páginas
            if (item.text && item.text.includes('[CORTE]')) {
              choppedPages = item.text.split('[CORTE]');
            } else {
              // Si no tiene cortes, el texto entero se vuelve la página uno
              choppedPages = [item.text || 'Sin bitácora registrada.'];
            }

            return {
              arcoNum: item.arcoNum || 'ARCO I',
              arcoTitle: item.arcoTitle || 'Tohka Return',
              title: item.title || 'Tohka estaba rara',
              text: item.text || '',
              order: item.order || 0,
              pages: choppedPages // Guardamos las páginas procesadas
            };
          });
          
          // Capturamos la URL unificada de fondo del primer registro que viene de la BD
          if (data.length > 0) {
            this.bgImageUrl = data[0].bgImageUrl;
          }
          
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error cargando la configuración dinámica:', err)
      });
    }
  }

  // --- NAVEGACIÓN EXCLUSIVA DEL CARRUSEL INTERNO DE PÁGINAS ---
  changePage(offset: number): void {
    const currentEntry = this.entries[this.currentIndex];
    if (!currentEntry) return;

    const targetPage = this.currentPage + offset;

    // Si la página siguiente existe en la bolsa, avanzamos con audio elástico
    if (targetPage >= 0 && targetPage < currentEntry.pages.length) {
      this.currentPage = targetPage;
      this.audio.playMenuSound('move'); // Efecto de ráfaga
    } else {
      this.audio.playMenuSound('move'); // Sonido de tope por hardware
    }
    this.cdr.detectChanges();
  }

  // --- CAPTURA DE TECLADO WEB NATIVA ---
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.entries.length === 0) return;

    // CONTROLES DE LA PANTALLA MASIVA DE LECTURA ACTIVA
    if (this.isReading) {
      // 1. Avanzar sub-capítulo con Flecha Derecha o la tecla D
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        this.changePage(1);
      } 
      // 2. Retroceder sub-capítulo con Flecha Izquierda o la tecla A
      else if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        this.changePage(-1);
      } 
      // 3. Cerrar el libro y salir
      else if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        this.toggleReading(false);
      }
      return;
    }

    // Desplazamiento vertical por las franjas estilo Rewind (W / S)
    if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
      this.changeSelection(1);
    } else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      this.changeSelection(-1);
    } 
    // Regresar al menú raíz de BEASTUI
    else if (event.key === 'Escape' || event.key === 'Backspace') {
      this.goBack();
    } 
    // Desplegar visor de lectura masivo con Enter o Espacio
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleReading(true);
    }
  }

  changeSelection(offset: number): void {
    this.currentIndex = (this.currentIndex + offset + this.entries.length) % this.entries.length;
    this.audio.playMenuSound('move');

    // --- TRUCO WEB RECONOCIDO: SCROLL AUTOMÁTICO DE SEGUIMIENTO ---
    setTimeout(() => {
      const activeSlot = document.querySelector('.diary-item.active, .diary-card.active, .item-active');
      if (activeSlot) {
        activeSlot.scrollIntoView({
          behavior: 'smooth', 
          block: 'nearest'    
        });
      }
    }, 50);
  }

  onMouseEnter(index: number): void {
    if (this.isReading) return;
    if (index !== this.currentIndex) {
      this.currentIndex = index;
      this.audio.playMenuSound('move');
    }
  }

  toggleReading(state: boolean): void {
    this.isReading = state;
    // Reseteamos el paginador a la primera hoja (Parte 1) cada vez que se abre un Arco
    this.currentPage = 0; 
    this.audio.playMenuSound('confirm');
    this.cdr.detectChanges();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
