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
          this.entries = data;
          
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

  // --- CAPTURA DE TECLADO WEB NATIVA ---
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.entries.length === 0) return;

    if (this.isReading) {
      if (event.key === 'Escape' || event.key === 'Backspace') {
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
    // Buscamos el elemento de la ranura activa en el HTML y obligamos al contenedor a centrarlo con animación suave
    setTimeout(() => {
      const activeSlot = document.querySelector('.rewind-slot.active');
      if (activeSlot) {
        activeSlot.scrollIntoView({
          behavior: 'smooth', // Animación elástica
          block: 'nearest'    // Lo acomoda en la zona visible más cercana
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
    this.audio.playMenuSound('confirm');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
