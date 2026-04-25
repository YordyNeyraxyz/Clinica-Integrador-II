import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginResponse, CompleteProfileResponse, CompleteProfileData } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  showProfileModal = false;

  profileData = {
    dni: '',
    age: null as number | null,
    email: '',
    name: '',
    firebaseUid: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // Login con Google
  async loginWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await firstValueFrom(this.authService.loginWithGoogle());

      // Ahora verificamos success y token
      if (response && response.success && response.token) {
        // Verificar si el usuario ya tiene perfil completo (tiene DNI y edad)
        const hasCompleteProfile = response.user?.dni && response.user?.age;

        if (hasCompleteProfile) {
          // Usuario ya existe y tiene perfil completo
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.router.navigate(['/dashboard']);
        } else {
          // Primer registro - mostrar modal para completar datos
          this.profileData.email = response.user?.email || '';
          this.profileData.name = response.user?.name || '';
          this.profileData.firebaseUid = response.user?.firebaseUid || '';
          this.showProfileModal = true;
        }
      } else {
        this.errorMessage = 'Respuesta inválida del servidor';
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      this.errorMessage = error.error?.message || error.message || 'Error al iniciar sesión con Google';
    } finally {
      this.isLoading = false;
    }
  }
  
  // Completar perfil (primer registro)
  async completeProfile(): Promise<void> {
    // Validaciones
    if (!this.profileData.dni || !this.profileData.dni.trim()) {
      this.errorMessage = 'Por favor complete el DNI';
      return;
    }

    if (!this.profileData.age) {
      this.errorMessage = 'Por favor complete la edad';
      return;
    }

    if (this.profileData.age < 0 || this.profileData.age > 120) {
      this.errorMessage = 'Por favor ingrese una edad válida';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      const dataToSend: CompleteProfileData = {
        dni: this.profileData.dni,
        age: this.profileData.age,
        email: this.profileData.email,
        name: this.profileData.name,
        firebaseUid: this.profileData.firebaseUid
      };

      const response = await firstValueFrom(this.authService.completeProfile(dataToSend));

      if (response && response.success && response.token) {
        // Guardar token y datos del usuario
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Cerrar modal y redirigir
        this.closeProfileModal();
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Error al guardar el perfil';
      }
    } catch (error: any) {
      console.error('Error al completar perfil:', error);
      this.errorMessage = error.error?.message || error.message || 'Error al completar el perfil';
    } finally {
      this.isSaving = false;
    }
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.profileData = {
      dni: '',
      age: null,
      email: '',
      name: '',
      firebaseUid: ''
    };
    this.errorMessage = '';
  }

  closeModalOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeProfileModal();
    }
  }
}