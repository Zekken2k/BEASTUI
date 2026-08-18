import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Audio } from '../../services/audio';
import { Data } from '../../services/data';

interface ProfileData {
  name: string;
  rank: string;
  status: string;
  bio: string;
  creativity: number;
  writing: number;
  database: number;
  design: number;
  lore: number;
}

@Component({
  selector: 'app-author-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './author-profile.html',
  styleUrls: ['./author-profile.css']
})
export class AuthorProfile implements OnInit {
  profile: ProfileData | null = null;

  constructor(
    private audio: Audio,
    private router: Router,
    private data: Data,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAuthorData();
  }

  private loadAuthorData(): void {
    if ((this.data as any).getAuthorProfile) {
      (this.data as any).getAuthorProfile().subscribe({
        next: (data: ProfileData) => {
          this.profile = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error jalando el perfil del autor:', err)
      });
    }
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
