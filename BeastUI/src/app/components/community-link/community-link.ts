import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Audio } from '../../services/audio';
import { Data } from '../../services/data';

@Component({
  selector: 'app-community-link',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-link.html',
  styleUrls: ['./community-link.css']
})
export class CommunityLink implements OnInit {
  // Almacenará la URL real que viaja de forma asíncrona desde HeidiSQL
  resolvedInviteUrl: string = '';

  constructor(
    private audio: Audio,
    private router: Router,
    private data: Data,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDatabaseInvite();
  }

  // --- CAPTURA ASÍNCRONA DE TU BASE DE DATOS ---
  private loadDatabaseInvite(): void {
    if ((this.data as any).getCommunityLink) {
      (this.data as any).getCommunityLink().subscribe({
        next: (response: { url: string }) => {
          this.resolvedInviteUrl = response.url;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error inyectando el enlace de Discord:', err);
          // Respaldo de seguridad por si pruebas el front suelto
          this.resolvedInviteUrl = 'https://discord.gg';
          this.cdr.detectChanges();
        }
      });
    }
  }

  // --- SOPORTE DE TECLADO FÍSICO DE PC ---
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openCommunityPortal();
    } else if (event.key === 'Escape' || event.key === 'Backspace') {
      this.goBack();
    }
  }

  // Redirección segura utilizando el enlace dinámico de tu base de datos
  openCommunityPortal(): void {
    if (!this.resolvedInviteUrl) return;
    this.audio.playMenuSound('confirm');
    window.open(this.resolvedInviteUrl, '_blank', 'noopener,noreferrer');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
