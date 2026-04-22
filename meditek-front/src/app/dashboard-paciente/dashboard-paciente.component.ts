import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialtyId: number;
  specialtyName: string;
}

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialtyName: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
}

interface Treatment {
  id: number;
  patientId: number;
  description: string;
  duration: number;
  durationUnit: string;
  medications: Medication[];
  startDate: string;
  endDate: string;
  status: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: number;
}

interface DailyMedication {
  medicationName: string;
  dosage: string;
  schedule: string;
  time: string;
}

@Component({
  selector: 'app-dashboard-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-paciente.component.html',
  styleUrls: ['./dashboard-paciente.component.scss']
})
export class DashboardPacienteComponent implements OnInit {
  activeTab: string = 'appointments';
  patientName: string = '';
  patientId: number = 0;

  // Doctores
  doctors: Doctor[] = [];
  availableDoctors: Doctor[] = [];

  // Citas
  appointments: Appointment[] = [];
  showAppointmentModal: boolean = false;
  appointmentForm = {
    doctorId: null as number | null,
    date: '',
    time: '',
    reason: ''
  };

  selectedAppointment: Appointment | null = null;
  showRescheduleModal: boolean = false;
  rescheduleDate: string = '';
  rescheduleTime: string = '';

  // Tratamientos
  treatments: Treatment[] = [];
  dailyMedications: DailyMedication[] = [];
  upcomingAppointments: Appointment[] = [];
  medicalReminders: string[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadData();
  }

  loadUserData(): void {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.patientName = userData.name || 'Paciente';
        this.patientId = userData.id || 1;
      } catch (e) {
        this.patientName = 'Paciente';
        this.patientId = 1;
      }
    }
  }

  loadData(): void {
    // Cargar doctores del admin
    const storedDoctors = localStorage.getItem('doctors');
    if (storedDoctors) {
      this.doctors = JSON.parse(storedDoctors);
    } else {
      // Doctores de ejemplo
      this.doctors = [
        { id: 1, name: 'Dr. Juan Pérez', email: 'juan@meditek.com', phone: '987654321', specialtyId: 1, specialtyName: 'Medicina General' },
        { id: 2, name: 'Dra. María López', email: 'maria@meditek.com', phone: '987654322', specialtyId: 2, specialtyName: 'Cardiología' },
        { id: 3, name: 'Dr. Carlos Ruiz', email: 'carlos@meditek.com', phone: '987654323', specialtyId: 3, specialtyName: 'Pediatría' }
      ];
    }
    this.availableDoctors = [...this.doctors];

    // Cargar citas del paciente
    const storedAppointments = localStorage.getItem('paciente_appointments');
    if (storedAppointments) {
      this.appointments = JSON.parse(storedAppointments).filter((a: Appointment) => a.patientId === this.patientId);
    } else {
      this.appointments = [];
    }

    // Cargar tratamientos del paciente
    const storedTreatments = localStorage.getItem('medico_treatments');
    if (storedTreatments) {
      const allTreatments = JSON.parse(storedTreatments);
      this.treatments = allTreatments.filter((t: Treatment) => t.patientId === this.patientId && t.status === 'active');
    } else {
      this.treatments = [];
    }

    this.updateCalendar();
  }

  updateCalendar(): void {
    // Actualizar medicamentos diarios
    this.dailyMedications = [];
    const today = new Date().toISOString().split('T')[0];

    this.treatments.forEach(treatment => {
      if (treatment.startDate <= today && treatment.endDate >= today) {
        treatment.medications.forEach(med => {
          this.dailyMedications.push({
            medicationName: med.name,
            dosage: med.dosage,
            schedule: med.frequency,
            time: this.getScheduleTime(med.frequency)
          });
        });
      }
    });

    // Próximas citas (próximos 7 días)
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    this.upcomingAppointments = this.appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      return a.status !== 'cancelled' && a.status !== 'completed' && appointmentDate >= now && appointmentDate <= nextWeek;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Recordatorios médicos
    this.medicalReminders = [];

    // Recordatorio de medicamentos
    if (this.dailyMedications.length > 0) {
      this.medicalReminders.push(`💊 Tienes ${this.dailyMedications.length} medicamento(s) para tomar hoy`);
    }

    // Recordatorio de citas próximas
    if (this.upcomingAppointments.length > 0) {
      this.medicalReminders.push(`📅 Tienes ${this.upcomingAppointments.length} cita(s) programada(s) para esta semana`);
    }

    // Recordatorio de tratamientos activos
    if (this.treatments.length > 0) {
      this.medicalReminders.push(`📋 Tienes ${this.treatments.length} tratamiento(s) activo(s)`);
    }
  }

  getScheduleTime(frequency: string): string {
    if (frequency.includes('8')) return '08:00';
    if (frequency.includes('12')) return '12:00';
    if (frequency.includes('20')) return '20:00';
    return 'Según indicación';
  }

  // ==================== CITAS MÉDICAS ====================
  openAppointmentModal(): void {
    this.appointmentForm = {
      doctorId: null,
      date: '',
      time: '',
      reason: ''
    };
    this.showAppointmentModal = true;
  }

  saveAppointment(): void {
    if (!this.appointmentForm.doctorId || !this.appointmentForm.date || !this.appointmentForm.time) {
      alert('Por favor complete todos los campos');
      return;
    }

    const doctor = this.doctors.find(d => d.id === this.appointmentForm.doctorId);

    const newAppointment: Appointment = {
      id: Math.max(0, ...this.appointments.map(a => a.id), 0) + 1,
      patientId: this.patientId,
      patientName: this.patientName,
      doctorId: this.appointmentForm.doctorId,
      doctorName: doctor?.name || '',
      specialtyName: doctor?.specialtyName || '',
      date: this.appointmentForm.date,
      time: this.appointmentForm.time,
      reason: this.appointmentForm.reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.appointments.push(newAppointment);
    this.saveAppointments();
    this.updateCalendar();
    this.closeAppointmentModal();
    alert('✅ Cita reservada exitosamente. Esperando confirmación del médico.');
  }

  saveAppointments(): void {
    // Guardar todas las citas (no solo las del paciente)
    const storedAllAppointments = localStorage.getItem('paciente_appointments');
    let allAppointments: Appointment[] = storedAllAppointments ? JSON.parse(storedAllAppointments) : [];

    // Reemplazar o agregar
    const filtered = allAppointments.filter(a => a.id !== this.appointments.find(ap => ap.id === a.id)?.id);
    allAppointments = [...filtered, ...this.appointments];

    localStorage.setItem('paciente_appointments', JSON.stringify(allAppointments));
  }

  cancelAppointment(appointment: Appointment): void {
    if (confirm('¿Estás seguro de cancelar esta cita?')) {
      appointment.status = 'cancelled';
      this.saveAppointments();
      this.updateCalendar();
      alert('❌ Cita cancelada');
    }
  }

  openRescheduleModal(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.rescheduleDate = appointment.date;
    this.rescheduleTime = appointment.time;
    this.showRescheduleModal = true;
  }

  confirmReschedule(): void {
    if (this.selectedAppointment && this.rescheduleDate && this.rescheduleTime) {
      this.selectedAppointment.date = this.rescheduleDate;
      this.selectedAppointment.time = this.rescheduleTime;
      this.selectedAppointment.status = 'pending';
      this.saveAppointments();
      this.updateCalendar();
      this.closeRescheduleModal();
      alert('📅 Cita reprogramada exitosamente');
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmada',
      'in-progress': 'En atención',
      'completed': 'Finalizada',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'in-progress': 'in-progress',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    return classMap[status] || 'pending';
  }

  closeAppointmentModal(): void {
    this.showAppointmentModal = false;
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal = false;
    this.selectedAppointment = null;
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
      if (modalType === 'appointment') {
        this.closeAppointmentModal();
      } else if (modalType === 'reschedule') {
        this.closeRescheduleModal();
      }
    }
  }

  // Agrega este método para la fecha mínima
  todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Agrega este método para el progreso del tratamiento
  getTreatmentProgress(treatment: Treatment): number {
    const start = new Date(treatment.startDate).getTime();
    const end = new Date(treatment.endDate).getTime();
    const now = new Date().getTime();

    if (now <= start) return 0;
    if (now >= end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return (elapsed / total) * 100;
  }
}