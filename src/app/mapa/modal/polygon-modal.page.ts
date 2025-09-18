import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared-module'; // Importa el módulo compartido

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
  //IonText,
  IonList,
  IonListHeader,
  IonLabel,
  IonNote, // <-- ¡Importado para el texto "Requerido"!
  IonImg,
  IonGrid,
  IonRow,
  IonCol

} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

// 🔹 Importar servicio SQLite
import { SqliteService } from '../services/sqlite.service';

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
    IonImg,
    IonGrid,
    IonRow,
    IonCol,
    //IonText,
    SharedModule
  ],
})
export class PolygonModalPage {
  polygonForm: FormGroup;
  fotosBase64: string[] = [];
  constructor(  private modalController: ModalController,
              private fb: FormBuilder,
              private sqliteService: SqliteService

            ) {
    this.init();
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
      fotos: [[]]
    });

  }
  async init() {
    await this.sqliteService.initDB();
  }

  onFormChange(controlName: string) {
    // Usa el nombre del campo para obtener el control de forma dinámica
    const formControl = this.polygonForm.get(controlName);

    if (formControl && formControl.value) {
      // Convierte el valor a mayúsculas
      const capitalizedValue = formControl.value.toUpperCase();

      // Actualiza el valor del campo específico
      formControl.setValue(capitalizedValue, { emitEvent: false });
    }
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

  fotoBase64: string | null = null;

  async takePhoto() {
    try {
      // Verificar límite de 5 fotos
      const fotosActuales = this.polygonForm.get('fotos')?.value || [];
      if (fotosActuales.length >= 5) {
        console.warn('⚠️ Límite de 5 fotos alcanzado');
        return;
      }

      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        saveToGallery: true, // también en galería
      });

      const fileName = `photo_${Date.now()}.jpeg`;

      // Crear carpeta si no existe
      await Filesystem.mkdir({
        path: 'poligonos',
        directory: Directory.Data,
        recursive: true,
      }).catch(() => { });

      // Guardar foto en almacenamiento interno
      await Filesystem.writeFile({
        path: `poligonos/${fileName}`,
        data: image.base64String || '',
        directory: Directory.Data,
      });

      // Guardar referencia en el form (array de nombres de archivo)
      fotosActuales.push(fileName);
      this.polygonForm.patchValue({ fotos: fotosActuales });

      // Mostrar en vista previa (array base64 para UI)
      this.fotosBase64.push(`data:image/jpeg;base64,${image.base64String}`);

      console.log('✅ Foto guardada:', fileName);
    } catch (err) {
      console.error('❌ Error al tomar foto:', err);
    }
  }

  eliminarFoto(index: number) {
    // Eliminar de la UI
    this.fotosBase64.splice(index, 1);

    // Eliminar de referencias del form
    const fotos = this.polygonForm.get('fotos')?.value || [];
    fotos.splice(index, 1);
    this.polygonForm.patchValue({ fotos });
  }



  async loadPhoto(fileName: string) {
    const file = await Filesystem.readFile({
      path: `poligonos/${fileName}`,
      directory: Directory.Data,
    });
    return `data:image/jpeg;base64,${file.data}`;
  }

  cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }

  async save(): Promise<void> {
    if (this.polygonForm.valid) {
      try {
        const coords = 'MULTIPOLYGON(((...)))';

        await this.sqliteService.addPoligono(this.polygonForm.value, coords);

        console.log('✅ Polígono guardado en SQLite');

        await this.modalController.dismiss(this.polygonForm.value, 'confirm');
      } catch (err) {
        console.error('❌ Error al guardar en SQLite:', err);
      }
    } else {
      console.warn('⚠️ Formulario inválido');
    }
  }



}