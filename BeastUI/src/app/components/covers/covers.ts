import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Audio } from '../../services/audio';
import { Data } from '../../services/data';

interface FanficCover {
  vol: string;
  title: string;
  synopsis: string;
  type: 'PORTADA' | 'ILUSTRACION'; // Identificador de subcategoría
  imageUrl: string;
}

@Component({
  selector: 'app-covers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './covers.html',
  styleUrls: ['./covers.css']
})
export class Covers implements OnInit {
  allCovers: FanficCover[] = [];       // Todos los datos de la BD
  filteredCovers: FanficCover[] = [];  // Datos filtrados por la pestaña activa
  
  uniqueVolumes: string[] = [];        // Lista de volúmenes únicos (Vol. 1, Vol. 2...)
  currentVolIndex: number = 0;         // Volumen seleccionado en las flechas superiores
  
  activeTab: 'PORTADA' | 'ILUSTRACION' = 'PORTADA'; // Subcategoría activa
  currentIndex: number = 0;            // Índice de la imagen dentro de la pestaña actual
  isMaximized: boolean = false;

  constructor(
    private audio: Audio,
    private data: Data,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDatabaseCovers();
  }

  private loadDatabaseCovers(): void {
    this.data.getCovers().subscribe({
      next: (data: any[]) => {
        this.allCovers = data;
        
        // Extraemos los volúmenes únicos que existan en HeidiSQL sin repetir
        this.uniqueVolumes = [...new Set(data.map(item => item.vol))];
        
        this.filterData();
      },
      error: (err) => console.error(err)
    });
  }

  // --- FILTRADO INTELIGENTE POR VOLUMEN Y PESTAÑA ---
  filterData(): void {
    const activeVolume = this.uniqueVolumes[this.currentVolIndex];
    
    // Filtramos las imágenes que cumplan con el Volumen Y el Tipo activo
    this.filteredCovers = this.allCovers.filter(
      item => item.vol === activeVolume && item.type === this.activeTab
    );
    
    // Reseteamos el índice a la primera imagen encontrada en esta sección
    this.currentIndex = 0;
    this.cdr.detectChanges();
  }

  // Cambiar de Volumen con las flechas superiores
  moveVolume(offset: number): void {
    if (this.uniqueVolumes.length === 0) return;
    this.currentVolIndex = (this.currentVolIndex + offset + this.uniqueVolumes.length) % this.uniqueVolumes.length;
    this.audio.playMenuSound('move');
    this.filterData();
  }

  // Cambiar de Pestaña con Q y E o Clics (Portadas vs Ilustraciones extras)
  switchTab(tab: 'PORTADA' | 'ILUSTRACION'): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.audio.playMenuSound('move');
      this.filterData();
    }
  }

  // Desplazarse por si hay más de una foto dentro de la misma categoría
moveCarousel(offset: number): void {
  // Si hay más fotos en este volumen, se mueve normal
  if (this.filteredCovers.length > 1) {
    this.currentIndex = (this.currentIndex + offset + this.filteredCovers.length) % this.filteredCovers.length;
  } else {
    // Si hay una sola, la flecha avanza o retrocede el volumen completo
    this.moveVolume(offset);
  }
  this.audio.playMenuSound('move');
}


  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.isMaximized) {
      if (event.key === 'Escape' || event.key === 'Backspace' || event.key === ' ') {
        event.preventDefault();
        this.isMaximized = false;
        this.audio.playMenuSound('confirm');
      }
      return;
    }

    // Cambiar de foto interna (A / D)
    if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
      this.moveCarousel(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
      this.moveCarousel(-1);
    }
    // Cambiar de Pestaña con teclado (Q=Portadas, E=Ilustraciones)
    else if (event.key === 'q' || event.key === 'Q') {
      this.switchTab('PORTADA');
    } else if (event.key === 'e' || event.key === 'E') {
      this.switchTab('ILUSTRACION');
    }
    else if (event.key === 'Escape' || event.key === 'Backspace') {
      this.goBack();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this.filteredCovers.length > 0) {
        this.isMaximized = true;
        this.audio.playMenuSound('confirm');
      }
    }
  }

  goBack(): void { this.router.navigate(['/']); }
}
