import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Audio } from '../../services/audio';
import { Data } from '../../services/data';

interface SocialCard {
  num: string;
  name: string;
  sub: string;
  rank: number;
  desc: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-social-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-links.html',
  styleUrls: ['./social-links.css']
})
export class SocialLinks implements OnInit {
  socialCards: SocialCard[] = [];
  currentIndex: number = 0;

  constructor(
    private audio: Audio,
    private router: Router,
    private data: Data,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDatabaseSocialLinks();
  }

  private loadDatabaseSocialLinks(): void {
    this.data.getSocialLinks().subscribe({
      next: (data) => {
        this.socialCards = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando Social Links de HeidiSQL:', err)
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.socialCards.length === 0) return;

    if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
      this.changeSelection(1);
    } else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      this.changeSelection(-1);
    } else if (event.key === 'Escape' || event.key === 'Backspace') {
      this.goBack();
    } else if (event.key === 'Enter') {
      console.log('Abriendo detalles de Arcana en Angular:', this.socialCards[this.currentIndex].name);
    }
  }

  // --- CAMBIO DE SELECCIÓN CON ENFOQUE DE SCROLL AUTOMÁTICO ---
  changeSelection(offset: number): void {
    // 1. Calculamos el siguiente índice matemático dentro del array
    this.currentIndex = (this.currentIndex + offset + this.socialCards.length) % this.socialCards.length;
    this.audio.playMenuSound('move');

    // --- REPARACIÓN DE SEGUIMIENTO AUTOMÁTICO DE SCROLL ---
    setTimeout(() => {
      // 2. CORRECCIÓN CLAVE: Cambiamos el query selector para que busque la nueva clase neutra purificada
      const activeCard = document.querySelector('.network-link-card.item-active');
      
      if (activeCard) {
        // 3. Forzamos al canvas de Angular a desplazar la vista elásticamente hasta el slot blanco
        activeCard.scrollIntoView({ 
          behavior: 'smooth', // Animación elástica suave de tu menú
          block: 'nearest'    // Lo encuadra en la zona visible más cómoda del contenedor
        });
      }
    }, 50);

    this.cdr.detectChanges();
  }


  // --- NAVEGACIÓN POR MOUSE CON ENFOQUE DE SCROLL AUTOMÁTICO ---
  onMouseEnter(index: number): void {
    if (index !== this.currentIndex) {
      this.currentIndex = index;
      this.audio.playMenuSound('move');
      this.scrollToActive();
    }
  }

  // Lógica compartida para desplazar de forma invisible el abanico
  private scrollToActive(): void {
    setTimeout(() => {
      const elements = document.querySelectorAll('.social-card');
      const activeElement = elements[this.currentIndex];
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }, 10);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // --- CÁLCULO MATEMÁTICO DEL ABANICO INVERTIDO INFINITO ---
  getTransform(index: number): string {
    // Reemplazamos el arreglo curveX por una función de onda sinusoidal para que dibuje la curva
    // de forma matemática infinita sin importar si tienes 5 o 50 personajes en HeidiSQL.
    let x = Math.sin(index * 0.35) * 1.2; 
    let y = 0;
    const skewAngle = -14;

    if (index === this.currentIndex) {
      x = x + 2.0; 
    } else if (index < this.currentIndex) {
      y = -1.2;
    } else if (index > this.currentIndex) {
      y = 1.2;
    }

    return `translate(${x}vw, ${y}vh) scale(${index === this.currentIndex ? 1.05 : 1}) skewX(${skewAngle}deg)`;
  }

  hasValidImage(): boolean {
    if (!this.socialCards || this.socialCards.length === 0) return false;
    const url = this.socialCards[this.currentIndex]?.avatarUrl;
    if (!url || url === 'null' || url.trim() === '') {
      return false;
    }
    return true;
  }
}
