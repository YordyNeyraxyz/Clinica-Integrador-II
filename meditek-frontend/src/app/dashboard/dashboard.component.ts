import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Specialty {
  id: number;
  name: string;
  icon: string;
  description: string;
  doctors: Doctor[];
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialtyId: number;
  specialtyName: string;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  createdAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Variables de UI
  activeTab: string = 'specialties'; // specialties, doctors, pharmacy, analytics

  // Especialidades
  specialties: Specialty[] = [];
  showSpecialtyModal: boolean = false;
  editingSpecialty: Specialty | null = null;
  specialtyForm = {
    name: '',
    icon: '',
    description: ''
  };

  // Doctores
  doctors: Doctor[] = [];
  showDoctorModal: boolean = false;
  editingDoctor: Doctor | null = null;
  doctorForm = {
    name: '',
    email: '',
    phone: '',
    specialtyId: null as number | null
  };

  // Farmacia
  products: Product[] = [];
  showProductModal: boolean = false;
  editingProduct: Product | null = null;
  productForm = {
    name: '',
    price: null as number | null,
    stock: null as number | null,
    description: ''
  };

  // Analytics
  totalDoctors: number = 0;
  totalProducts: number = 0;
  totalStock: number = 0;
  totalValue: number = 0;

  adminName: string = 'Administrador';

  // Iconos disponibles
  availableIcons = ['🏥', '❤️', '👶', '🧠', '🦷', '👁️', '🩺', '💊', '🔬', '🩻', '⚕️', '🏨'];

  constructor() { }


  ngOnInit(): void {
    this.loadData();
    this.getAdminName();
  }

  getAdminName(): void {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.adminName = userData.name || 'Administrador';
      } catch (e) {
        this.adminName = 'Administrador';
      }
    }
  }

  loadData(): void {
    // Cargar especialidades
    const storedSpecialties = localStorage.getItem('specialties');
    if (storedSpecialties) {
      this.specialties = JSON.parse(storedSpecialties);
    } else {
      // Datos iniciales
      this.specialties = [
        { id: 1, name: 'Medicina General', icon: '🏥', description: 'Atención primaria y chequeos preventivos', doctors: [] },
        { id: 2, name: 'Cardiología', icon: '❤️', description: 'Cuidado especializado del corazón', doctors: [] },
        { id: 3, name: 'Pediatría', icon: '👶', description: 'Atención integral para niños y adolescentes', doctors: [] },
        { id: 4, name: 'Neurología', icon: '🧠', description: 'Tratamiento del sistema nervioso', doctors: [] },
        { id: 5, name: 'Odontología', icon: '🦷', description: 'Salud dental y maxilofacial', doctors: [] },
        { id: 6, name: 'Oftalmología', icon: '👁️', description: 'Cuidado de la visión', doctors: [] }
      ];
      this.saveSpecialties();
    }

    // Cargar doctores
    const storedDoctors = localStorage.getItem('doctors');
    if (storedDoctors) {
      this.doctors = JSON.parse(storedDoctors);
      this.updateSpecialtiesDoctors();
    } else {
      this.doctors = [];
      this.saveDoctors();
    }

    // Cargar productos
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      this.products = JSON.parse(storedProducts);
    } else {
      this.products = [];
      this.saveProducts();
    }

    this.updateAnalytics();
  }

  updateSpecialtiesDoctors(): void {
    this.specialties.forEach(specialty => {
      specialty.doctors = this.doctors.filter(d => d.specialtyId === specialty.id);
    });
  }

  saveSpecialties(): void {
    localStorage.setItem('specialties', JSON.stringify(this.specialties));
    this.updateAnalytics();
  }

  saveDoctors(): void {
    localStorage.setItem('doctors', JSON.stringify(this.doctors));
    this.updateSpecialtiesDoctors();
    this.updateAnalytics();
  }

  saveProducts(): void {
    localStorage.setItem('products', JSON.stringify(this.products));
    this.updateAnalytics();
  }

  updateAnalytics(): void {
    this.totalDoctors = this.doctors.length;
    this.totalProducts = this.products.length;
    this.totalStock = this.products.reduce((sum, p) => sum + p.stock, 0);
    this.totalValue = this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }

  // ==================== ESPECIALIDADES ====================
  openSpecialtyModal(specialty?: Specialty): void {
    if (specialty) {
      this.editingSpecialty = specialty;
      this.specialtyForm = {
        name: specialty.name,
        icon: specialty.icon,
        description: specialty.description
      };
    } else {
      this.editingSpecialty = null;
      this.specialtyForm = { name: '', icon: '🏥', description: '' };
    }
    this.showSpecialtyModal = true;
  }

  saveSpecialty(): void {
    if (!this.specialtyForm.name) return;

    if (this.editingSpecialty) {
      // Editar
      const index = this.specialties.findIndex(s => s.id === this.editingSpecialty!.id);
      if (index !== -1) {
        this.specialties[index] = {
          ...this.specialties[index],
          name: this.specialtyForm.name,
          icon: this.specialtyForm.icon,
          description: this.specialtyForm.description
        };
      }
    } else {
      // Crear nueva
      const newId = Math.max(0, ...this.specialties.map(s => s.id)) + 1;
      this.specialties.push({
        id: newId,
        name: this.specialtyForm.name,
        icon: this.specialtyForm.icon,
        description: this.specialtyForm.description,
        doctors: []
      });
    }

    this.saveSpecialties();
    this.closeSpecialtyModal();
  }

  deleteSpecialty(id: number): void {
    if (confirm('¿Eliminar esta especialidad? Se eliminarán los doctores asociados.')) {
      this.specialties = this.specialties.filter(s => s.id !== id);
      this.doctors = this.doctors.filter(d => d.specialtyId !== id);
      this.saveSpecialties();
      this.saveDoctors();
    }
  }

  closeSpecialtyModal(): void {
    this.showSpecialtyModal = false;
    this.editingSpecialty = null;
  }

  // ==================== DOCTORES ====================
  openDoctorModal(doctor?: Doctor): void {
    if (doctor) {
      this.editingDoctor = doctor;
      this.doctorForm = {
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialtyId: doctor.specialtyId
      };
    } else {
      this.editingDoctor = null;
      this.doctorForm = { name: '', email: '', phone: '', specialtyId: null };
    }
    this.showDoctorModal = true;
  }

  saveDoctor(): void {
    if (!this.doctorForm.name || !this.doctorForm.specialtyId) return;

    const specialty = this.specialties.find(s => s.id === this.doctorForm.specialtyId);

    if (this.editingDoctor) {
      // Editar
      const index = this.doctors.findIndex(d => d.id === this.editingDoctor!.id);
      if (index !== -1) {
        this.doctors[index] = {
          ...this.doctors[index],
          name: this.doctorForm.name,
          email: this.doctorForm.email,
          phone: this.doctorForm.phone,
          specialtyId: this.doctorForm.specialtyId,
          specialtyName: specialty?.name || ''
        };
      }
    } else {
      // Crear nuevo
      const newId = Math.max(0, ...this.doctors.map(d => d.id), 0) + 1;
      this.doctors.push({
        id: newId,
        name: this.doctorForm.name,
        email: this.doctorForm.email,
        phone: this.doctorForm.phone,
        specialtyId: this.doctorForm.specialtyId,
        specialtyName: specialty?.name || '',
        createdAt: new Date().toISOString()
      });
    }

    this.saveDoctors();
    this.closeDoctorModal();
  }

  deleteDoctor(id: number): void {
    if (confirm('¿Eliminar este doctor?')) {
      this.doctors = this.doctors.filter(d => d.id !== id);
      this.saveDoctors();
    }
  }

  closeDoctorModal(): void {
    this.showDoctorModal = false;
    this.editingDoctor = null;
  }

  getSpecialtyName(specialtyId: number): string {
    return this.specialties.find(s => s.id === specialtyId)?.name || 'No asignada';
  }

  // ==================== FARMACIA ====================
  openProductModal(product?: Product): void {
    if (product) {
      this.editingProduct = product;
      this.productForm = {
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description
      };
    } else {
      this.editingProduct = null;
      this.productForm = { name: '', price: null, stock: null, description: '' };
    }
    this.showProductModal = true;
  }

  saveProduct(): void {
    if (!this.productForm.name || this.productForm.price === null || this.productForm.stock === null) return;

    if (this.editingProduct) {
      // Editar
      const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          name: this.productForm.name,
          price: this.productForm.price,
          stock: this.productForm.stock,
          description: this.productForm.description
        };
      }
    } else {
      // Crear nuevo
      const newId = Math.max(0, ...this.products.map(p => p.id), 0) + 1;
      this.products.push({
        id: newId,
        name: this.productForm.name,
        price: this.productForm.price,
        stock: this.productForm.stock,
        description: this.productForm.description,
        createdAt: new Date().toISOString()
      });
    }

    this.saveProducts();
    this.closeProductModal();
  }

  deleteProduct(id: number): void {
    if (confirm('¿Eliminar este producto?')) {
      this.products = this.products.filter(p => p.id !== id);
      this.saveProducts();
    }
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.editingProduct = null;
  }

  // ==================== UTILIDADES ====================
  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Cerrar modal al hacer clic en el backdrop
  closeModalOnBackdrop(event: MouseEvent, modalType: string): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      switch (modalType) {
        case 'specialty':
          this.closeSpecialtyModal();
          break;
        case 'doctor':
          this.closeDoctorModal();
          break;
        case 'product':
          this.closeProductModal();
          break;
      }
    }
  }
}