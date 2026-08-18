import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Audio } from '../../services/audio';
import { Data } from '../../services/data';

interface TohkaEntry {
  arcoNum: string;
  arcoTitle: string;
  title: string;
  text: string;
  order: number;
}

@Component({
  selector: 'app-diario-tohka',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diario-tohka.html',
  styleUrls: ['./diario-tohka.css']
})
export class DiarioTohka implements OnInit {
  entries: TohkaEntry[] = [];
  currentIndex: number = 0;
  isReading: boolean = false; // Controla si se expande la bitácora completa
  bgImageUrl: string = '';    // URL de la imagen de Tohka desde HeidiSQL

  constructor(
    private audio: Audio,
    private router: Router,
    private data: Data,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDatabaseDiaries();
  }

  private loadDatabaseDiaries(): void {
    if ((this.data as any).getTohkaDiary) {
      (this.data as any).getTohkaDiary().subscribe({
        next: (data: any[]) => {
          this.entries = data;
          if (data.length > 0) {
            this.bgImageUrl = data[0].bgImageUrl;
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error inyectando tohka_diary:', err)
      });
    }
  }

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

    // Desplazamiento vertical por las celdas de la rejilla (W / S)
    if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
      this.changeSelection(1);
    } else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      this.changeSelection(-1);
    } else if (event.key === 'Escape' || event.key === 'Backspace') {
      this.goBack();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleReading(true);
    }
  }

  changeSelection(offset: number): void {
    this.currentIndex = (this.currentIndex + offset + this.entries.length) % this.entries.length;
    this.audio.playMenuSound('move');

    // Scroll automático de seguimiento para que la lista no se rompa
    setTimeout(() => {
      const activeItem = document.querySelector('.fanfic-grid-row.item-active');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
