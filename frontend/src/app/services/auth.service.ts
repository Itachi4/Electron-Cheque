import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private readonly BASE_URL = 'http://localhost:3000/api';
  private readonly BASE_URL = '/api';

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string) {
    return this.http.post(`${this.BASE_URL}/login`, { email, password })
  }
}
