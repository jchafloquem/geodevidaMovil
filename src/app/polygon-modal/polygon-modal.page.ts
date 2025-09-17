import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonButtons,
  ModalController,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-polygon-modal',
  templateUrl: './polygon-modal.page.html',
  styleUrls: ['./polygon-modal.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // <-- Asegúrate de que estén aquí
    ReactiveFormsModule, // <-- Asegúrate de que estén aquí
    // ... el resto de tus importaciones de Ionic
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonButtons,

  ],
})
export class PolygonModalPage {
  polygonForm: FormGroup;

  constructor(private modalController: ModalController, private fb: FormBuilder) {
    addIcons({ closeOutline });
    this.polygonForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]], // DNI de 8 dígitos
      apellido_paterno: ['', Validators.required],
      apellido_materno: ['', Validators.required],
      nombres: ['', Validators.required],
      organizacion: ['', Validators.required],
      participante: ['', Validators.required],
      fecha_de_nacimiento: ['', Validators.required],
    });
  }

  cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }

  save() {
    if (this.polygonForm.valid) {
      return this.modalController.dismiss(this.polygonForm.value, 'confirm');
    }
    return;
  }

  logFormState() {
    console.log('Form is valid:', this.polygonForm.valid);
    console.log('Form value:', this.polygonForm.value);
    console.log('Form errors:', this.polygonForm.errors);
    console.log('DNI control errors:', this.polygonForm.get('dni')?.errors);
    console.log('Date control errors:', this.polygonForm.get('fecha_de_nacimiento')?.errors);
  }
}