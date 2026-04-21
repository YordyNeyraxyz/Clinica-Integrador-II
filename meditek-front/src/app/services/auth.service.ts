import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

export interface LoginResponse {
    success: boolean;
    token: string;
    user: {
        id: number;
        firebaseUid: string;
        email: string;
        name: string;
        dni?: string | null;
        age?: number | null;
        role: string;
        createdAt?: string;
        updatedAt?: string;
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

    constructor(
        private http: HttpClient,
        private auth: Auth
    ) { }

    loginWithGoogle(): Observable<LoginResponse> {

        const provider = new GoogleAuthProvider();

        return from(signInWithPopup(this.auth, provider)).pipe(

            switchMap(async (credential) => {

                const idToken = await credential.user.getIdToken();

                return idToken;
            }),

            switchMap((idToken) =>
                this.http.post<LoginResponse>(
                    `${this.apiUrl}/auth/google`,
                    { idToken }
                )
            )
        );
    }

    completeProfile(data: CompleteProfileData): Observable<CompleteProfileResponse> {
        return this.http.post<CompleteProfileResponse>(
            `${this.apiUrl}/auth/complete-profile`,
            data
        );
    }

    async logout(): Promise<void> {
        await this.auth.signOut();

        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    getCurrentUser(): any {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}