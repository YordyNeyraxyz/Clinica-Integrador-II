import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  dni: string;
  age: number;
  address: string;
  bloodType: string;
  allergies: string[];
  createdAt: string;
  medicalHistory?: MedicalHistory;
}

interface MedicalHistory {
  id: number;
  patientId: number;
  chronicDiseases: string[];
  surgeries: string[];
  familyHistory: string;
  medications: string[];
  createdAt: string;
  updatedAt: string;
}

interface Consultation {
  id: number;
  patientId: number;
  patientName: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  observations: string;
  images: string[];
  treatment?: Treatment;
  prescription?: Prescription;
  nextAppointment?: string;
  status: 'completed' | 'in-progress';
}

interface Treatment {
  id: number;
  consultationId: number;
  patientId: number;
  description: string;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months';
  medications: Medication[];
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  evolution: Evolution[];
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: number;
}

interface Evolution {
  date: string;
  notes: string;
  doctorName: string;
}

interface Prescription {
  id: number;
  consultationId: number;
  patientId: number;
  patientName: string;
  medications: string;
  instructions: string;
  createdAt: string;
  hospitalSeal: string;
}

interface Referral {
  id: number;
  patientId: number;
  patientName: string;
  fromSpecialty: string;
  toSpecialty: string;
  reason: string;
  status: 'pending' | 'approved' | 'completed';
  createdAt: string;
  newAppointmentDate?: string;
}

@Component({
  selector: 'app-dashboard-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-medico.component.html',
  styleUrls: ['./dashboard-medico.component.scss']
})
export class DashboardMedicoComponent implements OnInit {
  activeTab: string = 'patients';
  doctorName: string = 'Dr. Médico';
  referrals: Referral[] = [];
  errorMessage: string = '';

  // Pacientes
  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  showPatientModal: boolean = false;
  editingPatient: Patient | null = null;
  patientForm = {
    name: '',
    email: '',
    phone: '',
    dni: '',
    age: null as number | null,
    address: '',
    bloodType: '',
    allergies: ''
  };

  // Consultas
  consultations: Consultation[] = [];
  showConsultationModal: boolean = false;
  selectedConsultation: Consultation | null = null;
  consultationForm = {
    patientId: null as number | null,
    symptoms: '',
    diagnosis: '',
    observations: '',
    images: [] as string[]
  };

  // Tratamientos
  treatments: Treatment[] = [];
  showTreatmentModal: boolean = false;
  selectedTreatment: Treatment | null = null;
  treatmentForm = {
    description: '',
    duration: null as number | null,
    durationUnit: 'days' as 'days' | 'weeks' | 'months',
    medications: [] as Medication[],
    startDate: '',
    endDate: ''
  };

  newMedication: Medication = { name: '', dosage: '', frequency: '', duration: 0 };

  // Recetas
  showPrescriptionModal: boolean = false;
  prescriptionForm = {
    medications: '',
    instructions: ''
  };

  // Transferencias
  showReferralModal: boolean = false;
  referralForm = {
    patientId: null as number | null,
    toSpecialty: '',
    reason: ''
  };

  specialties: string[] = ['Medicina General', 'Cardiología', 'Pediatría', 'Neurología', 'Odontología', 'Oftalmología', 'Dermatología', 'Ginecología'];

  // Historial Clínico
  showMedicalHistoryModal: boolean = false;
  selectedMedicalHistory: MedicalHistory | null = null;

  // Próxima cita
  showAppointmentModal: boolean = false;
  appointmentDate: string = '';

  constructor() { }

  ngOnInit(): void {
    this.loadData();
    this.getDoctorName();
  }

  getDoctorName(): void {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.doctorName = userData.name || 'Dr. Médico';
      } catch (e) {
        this.doctorName = 'Dr. Médico';
      }
    }
  }

  loadData(): void {
    // Cargar pacientes
    const storedPatients = localStorage.getItem('medico_patients');
    if (storedPatients) {
      this.patients = JSON.parse(storedPatients);
    } else {
      // Datos de ejemplo
      this.patients = [
        {
          id: 1,
          name: 'María González',
          email: 'maria@email.com',
          phone: '987654321',
          dni: '71618201',
          age: 45,
          address: 'Av. Principal 123',
          bloodType: 'O+',
          allergies: ['Penicilina'],
          createdAt: new Date().toISOString(),
          medicalHistory: this.generateMedicalHistory(1)
        },
        {
          id: 2,
          name: 'Carlos Rodríguez',
          email: 'carlos@email.com',
          phone: '987654322',
          dni: '71618202',
          age: 32,
          address: 'Calle Los Pinos 456',
          bloodType: 'A+',
          allergies: [],
          createdAt: new Date().toISOString(),
          medicalHistory: this.generateMedicalHistory(2)
        }
      ];
      this.savePatients();
    }

    // Cargar consultas
    const storedConsultations = localStorage.getItem('medico_consultations');
    if (storedConsultations) {
      this.consultations = JSON.parse(storedConsultations);
    } else {
      this.consultations = [];
      this.saveConsultations();
    }

    // Cargar tratamientos
    const storedTreatments = localStorage.getItem('medico_treatments');
    if (storedTreatments) {
      this.treatments = JSON.parse(storedTreatments);
    } else {
      this.treatments = [];
      this.saveTreatments();
    }
  }

  // Generar historial clínico con IA (simulado)
  generateMedicalHistory(patientId: number): MedicalHistory {
    return {
      id: patientId,
      patientId: patientId,
      chronicDiseases: ['Hipertensión', 'Diabetes tipo 2'],
      surgeries: ['Apendicectomía (2015)'],
      familyHistory: 'Madre con hipertensión, padre sano',
      medications: ['Metformina 500mg', 'Enalapril 10mg'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  savePatients(): void {
    localStorage.setItem('medico_patients', JSON.stringify(this.patients));
  }

  saveConsultations(): void {
    localStorage.setItem('medico_consultations', JSON.stringify(this.consultations));
  }

  saveTreatments(): void {
    localStorage.setItem('medico_treatments', JSON.stringify(this.treatments));
  }

  // ==================== GESTIÓN DE PACIENTES ====================
  openPatientModal(patient?: Patient): void {
    if (patient) {
      this.editingPatient = patient;
      this.patientForm = {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dni: patient.dni,
        age: patient.age,
        address: patient.address,
        bloodType: patient.bloodType,
        allergies: patient.allergies.join(', ')
      };
    } else {
      this.editingPatient = null;
      this.patientForm = {
        name: '',
        email: '',
        phone: '',
        dni: '',
        age: null,
        address: '',
        bloodType: '',
        allergies: ''
      };
    }
    this.showPatientModal = true;
  }

  savePatient(): void {
    if (!this.patientForm.name || !this.patientForm.dni) return;

    if (this.editingPatient) {
      const index = this.patients.findIndex(p => p.id === this.editingPatient!.id);
      if (index !== -1) {
        this.patients[index] = {
          ...this.patients[index],
          name: this.patientForm.name,
          email: this.patientForm.email,
          phone: this.patientForm.phone,
          dni: this.patientForm.dni,
          age: this.patientForm.age || 0,
          address: this.patientForm.address,
          bloodType: this.patientForm.bloodType,
          allergies: this.patientForm.allergies.split(',').map(a => a.trim())
        };
      }
    } else {
      const newId = Math.max(0, ...this.patients.map(p => p.id), 0) + 1;
      const newPatient: Patient = {
        id: newId,
        name: this.patientForm.name,
        email: this.patientForm.email,
        phone: this.patientForm.phone,
        dni: this.patientForm.dni,
        age: this.patientForm.age || 0,
        address: this.patientForm.address,
        bloodType: this.patientForm.bloodType,
        allergies: this.patientForm.allergies.split(',').map(a => a.trim()),
        createdAt: new Date().toISOString(),
        medicalHistory: this.generateMedicalHistory(newId)
      };
      this.patients.push(newPatient);
    }

    this.savePatients();
    this.closePatientModal();
  }

  deletePatient(id: number): void {
    if (confirm('¿Eliminar este paciente? Se eliminarán todas sus consultas y tratamientos.')) {
      this.patients = this.patients.filter(p => p.id !== id);
      this.consultations = this.consultations.filter(c => c.patientId !== id);
      this.treatments = this.treatments.filter(t => t.patientId !== id);
      this.savePatients();
      this.saveConsultations();
      this.saveTreatments();
    }
  }

  closePatientModal(): void {
    this.showPatientModal = false;
    this.editingPatient = null;
  }

  viewMedicalHistory(patient: Patient): void {
    this.selectedMedicalHistory = patient.medicalHistory || this.generateMedicalHistory(patient.id);
    this.showMedicalHistoryModal = true;
  }

  // ==================== CONSULTA MÉDICA ====================

  openConsultationModal(patient?: Patient): void {

    if (patient) {
      this.consultationForm.patientId = patient.id;
    } else {
      if (!this.consultationForm.patientId) {
        this.errorMessage = 'Por favor seleccione un paciente';
        return;
      }
    }

    this.consultationForm.symptoms = '';
    this.consultationForm.diagnosis = '';
    this.consultationForm.observations = '';
    this.showConsultationModal = true;
  }

  saveConsultation(): void {
    if (!this.consultationForm.patientId || !this.consultationForm.diagnosis) return;

    const patient = this.patients.find(p => p.id === this.consultationForm.patientId);

    const newConsultation: Consultation = {
      id: Math.max(0, ...this.consultations.map(c => c.id), 0) + 1,
      patientId: this.consultationForm.patientId,
      patientName: patient?.name || '',
      date: new Date().toISOString(),
      symptoms: this.consultationForm.symptoms,
      diagnosis: this.consultationForm.diagnosis,
      observations: this.consultationForm.observations,
      images: this.consultationForm.images,
      status: 'completed'
    };

    this.consultations.push(newConsultation);
    this.saveConsultations();

    // Preguntar si quiere agregar tratamiento o receta
    if (confirm('¿Desea agregar un tratamiento para este paciente?')) {
      this.openTreatmentModal(newConsultation);
    }

    if (confirm('¿Desea generar una receta médica?')) {
      this.openPrescriptionModal(newConsultation, patient!);
    }

    this.closeConsultationModal();
  }

  closeConsultationModal(): void {
    this.showConsultationModal = false;
    this.selectedConsultation = null;
  }

  // ==================== TRATAMIENTOS ====================
  openTreatmentModal(consultation?: Consultation): void {
    this.selectedTreatment = null;
    this.treatmentForm = {
      description: '',
      duration: null,
      durationUnit: 'days',
      medications: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    };
    this.showTreatmentModal = true;
  }

  addMedication(): void {
    if (this.newMedication.name && this.newMedication.dosage) {
      this.treatmentForm.medications.push({ ...this.newMedication });
      this.newMedication = { name: '', dosage: '', frequency: '', duration: 0 };
    }
  }

  removeMedication(index: number): void {
    this.treatmentForm.medications.splice(index, 1);
  }

  calculateEndDate(): void {
    if (this.treatmentForm.duration && this.treatmentForm.startDate) {
      const start = new Date(this.treatmentForm.startDate);
      let end = new Date(start);
      switch (this.treatmentForm.durationUnit) {
        case 'days':
          end.setDate(start.getDate() + this.treatmentForm.duration);
          break;
        case 'weeks':
          end.setDate(start.getDate() + (this.treatmentForm.duration * 7));
          break;
        case 'months':
          end.setMonth(start.getMonth() + this.treatmentForm.duration);
          break;
      }
      this.treatmentForm.endDate = end.toISOString().split('T')[0];
    }
  }

  saveTreatment(): void {
    if (!this.treatmentForm.description) return;

    const newTreatment: Treatment = {
      id: Math.max(0, ...this.treatments.map(t => t.id), 0) + 1,
      consultationId: 0,
      patientId: this.consultationForm.patientId || 0,
      description: this.treatmentForm.description,
      duration: this.treatmentForm.duration || 0,
      durationUnit: this.treatmentForm.durationUnit,
      medications: this.treatmentForm.medications,
      startDate: this.treatmentForm.startDate,
      endDate: this.treatmentForm.endDate,
      status: 'active',
      evolution: []
    };

    this.treatments.push(newTreatment);
    this.saveTreatments();
    this.closeTreatmentModal();
  }

  completeTreatment(treatment: Treatment): void {
    treatment.status = 'completed';
    this.saveTreatments();
  }

  closeTreatmentModal(): void {
    this.showTreatmentModal = false;
  }

  // ==================== RECETAS ====================
  openPrescriptionModal(consultation: Consultation, patient: Patient): void {
    this.prescriptionForm = {
      medications: '',
      instructions: 'Tomar según indicación médica. No exceder la dosis recomendada.'
    };
    this.showPrescriptionModal = true;
  }

  generatePrescription(): void {
    if (!this.prescriptionForm.medications) return;

    const prescription: Prescription = {
      id: Math.max(0, ...this.consultations.map(c => c.id), 0) + 1,
      consultationId: this.consultationForm.patientId || 0,
      patientId: this.consultationForm.patientId || 0,
      patientName: this.patients.find(p => p.id === this.consultationForm.patientId)?.name || '',
      medications: this.prescriptionForm.medications,
      instructions: this.prescriptionForm.instructions,
      createdAt: new Date().toISOString(),
      hospitalSeal: '🏥 HOSPITAL MEDITEK - SELLO OFICIAL 🏥'
    };

    // Simular envío de correo
    alert(`📧 Receta enviada al correo del paciente\n\n${prescription.hospitalSeal}\n\nMedicamentos:\n${prescription.medications}\n\nInstrucciones:\n${prescription.instructions}\n\nAtentamente,\n${this.doctorName}`);

    this.closePrescriptionModal();
  }

  closePrescriptionModal(): void {
    this.showPrescriptionModal = false;
  }

  // ==================== TRANSFERENCIA ====================
  openReferralModal(patient: Patient): void {
    this.referralForm = {
      patientId: patient.id,
      toSpecialty: '',
      reason: ''
    };
    this.showReferralModal = true;
  }
  createReferral(): void {
    if (!this.referralForm.toSpecialty || !this.referralForm.reason) return;

    const patient = this.patients.find(p => p.id === this.referralForm.patientId);

    const newReferral: Referral = {
      id: Math.max(0, ...this.referrals.map(r => r.id), 0) + 1,
      patientId: this.referralForm.patientId!,
      patientName: patient?.name || '',
      fromSpecialty: 'Medicina General',
      toSpecialty: this.referralForm.toSpecialty,
      reason: this.referralForm.reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.referrals.push(newReferral);
    localStorage.setItem('medico_referrals', JSON.stringify(this.referrals));

    alert(`✅ Paciente derivado a ${this.referralForm.toSpecialty}\nMotivo: ${this.referralForm.reason}\nSe ha creado una nueva cita automáticamente.`);

    this.closeReferralModal();
  }

  closeReferralModal(): void {
    this.showReferralModal = false;
  }

  // ==================== PRÓXIMA CITA ====================
  openAppointmentModal(patient: Patient): void {
    this.selectedPatient = patient;
    this.appointmentDate = '';
    this.showAppointmentModal = true;
  }

  scheduleNextAppointment(): void {
    if (!this.appointmentDate) return;

    alert(`📅 Próxima cita agendada para ${this.selectedPatient?.name} el día ${this.appointmentDate}\nSe ha enviado un recordatorio al correo del paciente.`);

    this.closeAppointmentModal();
  }

  closeAppointmentModal(): void {
    this.showAppointmentModal = false;
    this.selectedPatient = null;
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

  closeModalOnBackdrop(event: MouseEvent, modalType: string): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      switch (modalType) {
        case 'patient':
          this.closePatientModal();
          break;
        case 'consultation':
          this.closeConsultationModal();
          break;
        case 'treatment':
          this.closeTreatmentModal();
          break;
        case 'prescription':
          this.closePrescriptionModal();
          break;
        case 'referral':
          this.closeReferralModal();
          break;
        case 'appointment':
          this.closeAppointmentModal();
          break;
        case 'medicalHistory':
          this.showMedicalHistoryModal = false;
          break;
      }
    }
  }

  getPatientName(): string {
    const patient = this.patients.find(p => p.id === this.consultationForm.patientId);
    return patient?.name || 'Seleccionado';
  }

  // Mejora este método
  getSelectedPatientName(): string {

    if (!this.consultationForm.patientId) {
      return 'No hay paciente seleccionado';
    }

    const patient = this.patients.find(p => p.id === this.consultationForm.patientId);

    return patient ? `${patient.name} - ${patient.dni}` : 'Paciente no encontrado';
  }
}