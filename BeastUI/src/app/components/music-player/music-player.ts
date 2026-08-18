import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Audio } from '../../services/audio';
import { Data } from '../../services/data';

interface TrackItem {
  title: string;
  tag: string;
  youtubeId: string;
  order: number;
  safeUrl?: SafeResourceUrl; // URL sanitizada para el iframe de YouTube
}

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music-player.html',
  styleUrls: ['./music-player.css']
})
export class MusicPlayer implements OnInit {
  playlist: TrackItem[] = [];
  currentIndex: number = 0;
  currentSafeUrl: SafeResourceUrl | null = null; // Enlace del video reproduciéndose ahora

  constructor(
    private audio: Audio,
    private router: Router,
    private data: Data,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDatabasePlaylist();
  }





  private loadDatabasePlaylist(): void {
    if ((this.data as any).getFanficOst) {
      (this.data as any).getFanficOst().subscribe({
        next: (data: any[]) => {
          this.playlist = data.map((track, index) => {
            const actualId = track.youtubeId || track.youtubeid || track.youtube_id;
          
          const embedUrl = `https://youtube.com/embed/${actualId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`;

            
            return {
              title: track.title || 'Sin Título',
              tag: track.tag || 'OST',
              youtubeId: actualId,
              order: track.order || (index + 1),
              safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl)
            };
          });

          // Inicializamos el reproductor con el primer elemento
          if (this.playlist.length > 0) {
            this.currentSafeUrl = this.playlist[0].safeUrl || null;
          
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error inyectando el OST desde HeidiSQL:', err)
      });
    }
  }

  // --- SELECCIÓN Y ACTUALIZACIÓN AL VUELO ---
  selectTrack(index: number): void {
    if (index !== this.currentIndex && this.playlist[index]) {
      this.currentIndex = index;
      this.currentSafeUrl = this.playlist[index].safeUrl || null;
      this.audio.playMenuSound('move');
      this.cdr.detectChanges();
    }
  }



  // --- CAPTURA DE TECLADO WEB INDESTRUCTIBLE ---
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.playlist.length === 0) return;

    if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
      this.changeSelection(1);
    } else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      this.changeSelection(-1);
    } else if (event.key === 'Escape' || event.key === 'Backspace') {
      this.goBack();
    }
  }

  changeSelection(offset: number): void {
    const nextIndex = (this.currentIndex + offset + this.playlist.length) % this.playlist.length;
    this.selectTrack(nextIndex);

    // Scroll automático de seguimiento para listas largas de canciones
    setTimeout(() => {
      const activeRow = document.querySelector('.ost-track-row.item-active');
      if (activeRow) {
        activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
