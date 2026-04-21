import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
    success: boolean;
    isFirstLogin: boolean;
    token: string;
    user: {
        id: string;
        email: string;
        name?: string;
        role: string;
        firebaseUid: string;
        dni?: string;
        age?: number;
    };
}

export interface CompleteProfileResponse {
    success: boolean;
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        firebaseUid: string;
        dni: string;
        age: number;
    };
}

export interface CompleteProfileData {
    dni: string;
    age: number;
    email: string;
    name: string;
    firebaseUid: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    // Login con Google
    loginWithGoogle(): Observable<LoginResponse> {
        // En Angular, primero obtienes el token de Firebase y lo envías al backend
        // Por ahora simulamos la llamada
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/google`, {});
    }

    // Completar perfil para primer registro
    completeProfile(data: CompleteProfileData): Observable<CompleteProfileResponse> {
        return this.http.post<CompleteProfileResponse>(`${this.apiUrl}/auth/complete-profile`, data);
    }

    // Cerrar sesión
    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Verificar si está autenticado
    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    // Obtener usuario actual
    getCurrentUser(): any {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}