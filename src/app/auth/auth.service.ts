import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { errorHandler } from '../error/error-handler';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private token: string;
    private userId: string;
    private authStatusListener = new BehaviorSubject<boolean>(false);
    private tokenTimer: any;

    constructor(private http: HttpClient, private router: Router) {}

    getToken() {
        return this.token;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getUserId() {
        return this.userId;
    }

    createUser(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        return this.http.post(environment.apiUrl + 'user/signup', authData)
        .pipe(catchError(errorHandler), tap(response => {
            this.router.navigate(['/auth/login']);
        }));
    }

    login(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        return this.http.post<{token: string, expiresIn: number, userId: string}>(environment.apiUrl + 'user/login', authData)
        .pipe(catchError(errorHandler), tap(response => {
            this.token = response.token;
            if(this.token) {
                const expiresInDuration = response.expiresIn;
                this.setAuthTimer(expiresInDuration);
                this.userId = response.userId;
                this.authStatusListener.next(true);
                const expirationDate = new Date(Date.now() + expiresInDuration * 1000);
                this.saveAuthData(this.token, expirationDate, this.userId);
                this.router.navigate(['/']);
            }
        }));
    }

    autoLogin() {
        const authData = this.getAuthData();
        if(!authData) {
            return;
        }
        const expiresIn = authData.expirationDate.getTime() - Date.now();
        if(expiresIn > 0) {
            this.token = authData.token;
            this.userId = authData.userId;
            this.setAuthTimer(expiresIn/1000)
            this.authStatusListener.next(true);
        }
    }

    logout() {
        this.token = null;
        this.authStatusListener.next(false);
        this.userId = null;
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/']);
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId);
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userId');
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const userId = localStorage.getItem('userId');

        if(!token || !expirationDate) {
            return;
        }

        return {token: token, expirationDate: new Date(expirationDate), userId: userId};
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }
}