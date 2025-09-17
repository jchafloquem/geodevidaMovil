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
  IonText,
  IonList,
  IonListHeader,
  IonLabel,
  IonNote, // <-- ¡Importado para el texto "Requerido"!
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
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonButtons,
    IonList,
    IonListHeader,
    IonLabel,
    IonNote, // <-- Asegúrate de que esté aquí.
  ],
})
export class PolygonModalPage {
  polygonForm: FormGroup;

  constructor(private modalController: ModalController, private fb: FormBuilder) {
    addIcons({ closeOutline });
    this.polygonForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      apellido_paterno: ['', Validators.required],
      apellido_materno: ['', Validators.required],
      nombres: ['', Validators.required],
      fecha_de_nacimiento: ['', Validators.required],
      organizacion: ['', Validators.required],
      participante: ['', Validators.required],
      cultivo: ['', Validators.required],
    });
  }
  onDniInput(event: any) {
    // Obtiene el valor actual del campo de entrada
    const inputValue = event.target.value;

    // Usa una expresión regular para eliminar cualquier caracter que NO sea un dígito (0-9)
    const sanitizedValue = inputValue.replace(/[^0-9]/g, '');

    // Actualiza el valor del FormControl del DNI con el valor limpio
    // El segundo argumento, `{ emitEvent: false }`, evita un bucle infinito de eventos
    this.polygonForm.get('dni')?.setValue(sanitizedValue, { emitEvent: false });
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
}