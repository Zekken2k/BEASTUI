import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Data {
  // Dirección pública oficial de tu servidor backend de Node en internet real
  private apiUrl = 'https://onrender.com';

  constructor(private http: HttpClient) {}

  // Petición HTTP para traer las opciones de tu fanfic desde la nube de Aiven
  getMenuOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/main-menu`);
  }

  // Petición HTTP para traer los Social Links del protagonista
  getSocialLinks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/social-links`);
  }
  
  // CORREGIDO: Mapeado asíncrono global para tus portadas en internet
  getCovers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/covers`);
  }

  // CORREGIDO: Enlace inalámbrico perimetral para el Diario de Shido con carrusel por partes
  getShidoDiary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/diario-shido`);
  }

  // CORREGIDO: Acceso para el Diario de Tohka (protegido por tu guardián CanActivate)
  getTohkaDiary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/diario-tohka`);
  }

  // CORREGIDO: Enlace global para reproducir tu banda sonora de YouTube OST
  getFanficOst(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fanfic-ost`);
  }

  // CORREGIDO: Consulta asíncrona inalámbrica para tu Compendio de Ángeles de Lore
  getFanficAngels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fanfic-angels`);
  }

  // CORREGIDO: Expediente confidencial del perfil del autor desde el servidor perimetral
  getAuthorProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/author-profile`);
  }

  // CORREGIDO: Consulta dinámica para la invitación flotante a tu Discord Oficial
  getCommunityLink(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/community-link`);
  }
}
