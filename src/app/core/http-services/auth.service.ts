import { LoginResponseDto, User } from '../api/core';
import { SuperService } from './super.service';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService extends SuperService<User> {

  constructor() {
    super('auth');
  }

  login(model) {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/${this.controller}/login`, model);
  }

  register(model) {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/${this.controller}/register`, model);
  }

  create(returnUrl, model) {
    return this.http.post(`${this.apiUrl}/${this.controller}/create/${returnUrl}`, model);
  }

  sendEmailForResetPassword(email, url, lang) {
    return this.http.get(`${this.apiUrl}/${this.controller}/sendEmailForResetPassword/${email}/${url}/${lang}`);
  }

  resetPassword(code, model) {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/${this.controller}/resetPassword/${code}`, model);
  }

  resetPasswordAtherant(code, model) {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/${this.controller}/resetPasswordAtherant/${code}`, model);
  }

  activeAccount(code) {
    return this.http.get(`${this.apiUrl}/${this.controller}/activeAccount/${code}`);
  }

  forgotPassword(email: string) {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/${this.controller}/forgotPassword/${email}`, {});
  }

}
