import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-fanfic-poll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fanfic-poll.html',
  styleUrls: ['./fanfic-poll.css']
})
export class FanficPoll implements OnInit {
  // REEMPLAZA ESTE LINK DE EJEMPLO POR EL ENLACE EMBEDDED REAL DE TU GOOGLE FORM
  rawFormUrl: string = 'https://docs.google.com/forms/d/e/1FAIpQLSdedxJxHm7u0qCE_RMEQk8-KzmXthhwxtl6cEhG6aRY414E7A/viewform?usp=publish-editor';
  safeFormUrl: SafeResourceUrl | null = null;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Sanitizamos el link de Google Forms para que Angular lo monte de forma nativa
    this.safeFormUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawFormUrl);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Backspace') {
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
