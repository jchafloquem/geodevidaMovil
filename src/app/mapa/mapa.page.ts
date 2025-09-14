import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

/* Libreria leaflet */
import * as L from 'leaflet';
/* Librerias capacitor */
import { Geolocation } from '@capacitor/geolocation';

/* Ionicons */
import { addIcons } from 'ionicons';
import { locateOutline } from 'ionicons/icons';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon
  ]
})
export class MapaPage implements AfterViewInit {
  private map!: L.Map;
  private userMarker?: L.Circle;
  private userCircle?: L.Circle;      // círculo central
private pulseCircle?: L.Circle;     // onda pulsante
private pulseInterval?: any;

  constructor() {
    addIcons({ locateOutline });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-9.19, -75.0152],
      zoom: 5
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: 'DEVIDA',
      maxZoom: 22
    }).addTo(this.map);

    // Importante: forzar actualización del tamaño del mapa
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  async locateUser() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });

      const lat = coordinates.coords.latitude;
      const lng = coordinates.coords.longitude;

      // Si ya existe círculo, actualizar posición
      if (this.userCircle) {
        this.userCircle.setLatLng([lat, lng]);
        if (this.pulseCircle) this.pulseCircle.setLatLng([lat, lng]);
      } else {
        // Círculo central
        this.userCircle = L.circle([lat, lng], {
          color: '#3880ff',
          fillColor: '#3880ff',
          fillOpacity: 1,
          radius: 5
        }).addTo(this.map).bindPopup('📍 Estás aquí');

        // Círculo pulsante inicial
        this.pulseCircle = L.circle([lat, lng], {
          color: '#3880ff',
          fillColor: '#3880ff',
          fillOpacity: 0.3,
          radius: 5
        }).addTo(this.map);

        // Animación pulsante
        let growing = true;
        let radius = 5;
        this.pulseInterval = setInterval(() => {
          if (!this.pulseCircle) return;

          if (growing) {
            radius += 2;
            if (radius >= 50) growing = false;
          } else {
            radius -= 2;
            if (radius <= 5) growing = true;
          }
          this.pulseCircle.setRadius(radius);
          const opacity = 0.3 * (50 - radius) / 40 + 0.1;
          this.pulseCircle.setStyle({ fillOpacity: opacity });
        }, 50);
      }

      this.map.setView([lat, lng], 18);
    } catch (error) {
      console.error('Error obteniendo ubicación', error);
    }
  }
}
