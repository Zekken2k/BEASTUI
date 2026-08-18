import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Data {
  // Dirección oficial de tu servidor backend de Node
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Petición HTTP para traer las 8 opciones de tu fanfic
  getMenuOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/main-menu`);
  }

  // Petición HTTP para traer los Social Links del protagonista
  getSocialLinks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/social-links`);
    
  }
  // 
getCovers(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:3000/api/covers');
}

getShidoDiary(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:3000/api/diario-shido');
}

getTohkaDiary(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:3000/api/diario-tohka');
}

getFanficOst(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:3000/api/fanfic-ost');
}

getFanficAngels(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:3000/api/fanfic-angels');
}

getAuthorProfile(): Observable<any> {
  return this.http.get<any>('http://localhost:3000/api/author-profile');
}

getCommunityLink(): Observable<any> {
  return this.http.get<any>('http://localhost:3000/api/community-link');
}
}
