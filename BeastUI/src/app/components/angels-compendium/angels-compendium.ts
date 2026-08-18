import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Audio } from '../../services/audio';
import { Data } from '../../services/data';

interface AngelLoreItem {
  arcanaNum: string;
  arcanaName: string;
  name: string;
  description: string;
  imageUrl: string;
  order: number;
}

@Component({
  selector: 'app-angels-compendium',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './angels-compendium.html',
  styleUrls: ['./angels-compendium.css']
})
export class AngelsCompendium implements OnInit {
  angelsList: AngelLoreItem[] = [];
  currentIndex: number = 0; // Controla qué Arcano/Ángel se está leyendo en pantalla

  constructor(
    private audio: Audio,
    private router: Router,
    private data: Data,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDatabaseAngels();
  }

  // --- TRAER INFORMACIÓN DE FORMA ASÍNCRONA DE TU TABLA FANFIC_ANGELS ---
  private loadDatabaseAngels(): void {
    if ((this.data as any).getFanficAngels) {
      (this.data as any).getFanficAngels().subscribe({
        next: (data: AngelLoreItem[]) => {
          this.angelsList = data;
          this.cdr.detectChanges(); // Forzamos redibujado inmediato de la vista
        },
        error: (err: any) => console.error('Error jalando el compendio de ángeles:', err)
      });
    } else {
      // Respaldo de desarrollo integrado en lo que sincronizas tu data.service.ts
      this.angelsList = [
        { 
          arcanaNum: 'VI', 
          arcanaName: 'LOVERS', 
          name: 'Queen Medb (Anomalía)', 
          description: 'Un Ángel original manifestado de forma errática en el fanfic. No responde a la voluntad de ningún espíritu común, alterando el flujo del Arcano VI con ráfagas de energía que perforan las defensas espaciales de las facciones rivales.', 
          imageUrl: 'https://imghosting.in', 
          order: 1 
        },
        { 
          arcanaNum: 'I', 
          arcanaName: 'MAGICIAN', 
          name: 'Surtur (B.E.A.S.T)', 
          description: 'Forjado en el núcleo del abismo cian. Este Ángel desata llamaradas de fuego espiritual denso que devoran el maná ambiental cercano, incrementando exponencialmente su ataque a costa de distorsionar el entorno.', 
          imageUrl: 'https://imghosting.in', 
          order: 2 
        }
      ];
      this.cdr.detectChanges();
    }
  }

  // --- CAPTURA DE TECLADO HORIZONTAL DE PC (< A / D >) ---
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.angelsList.length === 0) return;

    if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
      this.movePage(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
      this.movePage(-1);
    } else if (event.key === 'Escape' || event.key === 'Backspace') {
      this.goBack();
    }
  }

  movePage(offset: number): void {
    this.currentIndex = (this.currentIndex + offset + this.angelsList.length) % this.angelsList.length;
    this.audio.playMenuSound('move');
    this.cdr.detectChanges();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
