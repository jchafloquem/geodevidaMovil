import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trashOutline } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonLoading,
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
    IonToolbar,
    IonIcon,
    IonLoading
  ]
})
export class MapaPage implements AfterViewInit {
  private map!: L.Map;
  private userMarker?: L.Circle;
  private userCircle?: L.Circle;      // círculo central
  private pulseCircle?: L.Circle;     // onda pulsante
  private pulseInterval?: any;

  isLoading = false;

  gpsData: {
    lat: number;
    lng: number;
    alt: number | null;
    vel: number | null;
    accH: number | null;
    accV: number | null;
  } | null = null;

  constructor() {
    addIcons({ locateOutline, trashOutline });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-9.19, -75.0152],
      zoomControl: false,
      zoom: 5
    });
    // Mapa base: OpenStreeMap
    const lightLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: 'DEVIDA', maxZoom: 19 }
    );
    // Mapa base: Satellite
    const satelliteLayer = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      { attribution: 'DEVIDA', maxZoom: 20 }
    );

    satelliteLayer.addTo(this.map);

    L.control.layers(
      { 'Satellite': satelliteLayer, 'Light': lightLayer },
      undefined,
      { collapsed: true }
    ).addTo(this.map);

    // --- AQUI AGREGAMOS LA BARRA DE ESCALA ---
    L.control.scale({
      position: 'topleft',
      metric: true,
      imperial: false,
      maxWidth: 100
    }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }
    // Geolocalización con spinner
    async locateUser() {
      this.isLoading = true;
      try {
        const coordinates = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true
        });

        const { latitude, longitude, altitude, accuracy, altitudeAccuracy, speed } = coordinates.coords;

        // Guardar valores para mostrar en el template
       // Guardar valores para mostrar en el template
       this.gpsData = {
        lat: latitude !== null && latitude !== undefined ? parseFloat(latitude.toFixed(4)) : 0.0000,
        lng: longitude !== null && longitude !== undefined ? parseFloat(longitude.toFixed(4)) : 0.0000,
        alt: altitude !== null && altitude !== undefined ? parseFloat(altitude.toFixed(4)) : 0.0000,
        vel: speed !== null && speed !== undefined ? parseFloat(speed.toFixed(2)) : 0.00,
        accH: accuracy !== null && accuracy !== undefined ? parseFloat(accuracy.toFixed(4)) : 0.0000,
        accV: altitudeAccuracy !== null && altitudeAccuracy !== undefined ? parseFloat(altitudeAccuracy.toFixed(2)) : 0.00,
      };

        const lat = latitude;
        const lng = longitude;

        // Si ya existe círculo, actualizar posición
        if (this.userCircle) {
          this.userCircle.setLatLng([lat, lng]);
          if (this.pulseCircle) this.pulseCircle.setLatLng([lat, lng]);
        } else {
          // Círculo central
          this.userCircle = L.circle([lat, lng], {
            color: '#ffff',
            fillColor: '#0D9BD7',
            fillOpacity: 1,
            radius: 3,
            weight: 1
          }).addTo(this.map)

          // Círculo pulsante inicial
          this.pulseCircle = L.circle([lat, lng], {
            color: '#0DA642',
            fillColor: '#3880ff',
            fillOpacity: 0.3,
            radius: 3,
            weight: 0
          }).addTo(this.map);
          // Animación pulsante
          let growing = true;
          let radius = 3;
          const maxRadius = 50;

          this.pulseInterval = setInterval(() => {
            if (!this.pulseCircle) return;

            // aumentar el radio
            radius += 1; // velocidad de crecimiento, ajustable
            if (radius >= maxRadius) {
              radius = 3; // reinicia para crear pulso repetido
            }
            this.pulseCircle.setRadius(radius);
            const opacity = 0.6 * (maxRadius - radius) / maxRadius; // opacidad decreciente
            this.pulseCircle.setStyle({ fillOpacity: opacity });
            }, 50);
        }
        this.map.setView([lat, lng], 19);
      } catch (error) {
        console.error('Error obteniendo ubicación', error);
      } finally {
        this.isLoading = false;  // 👈 desactivar spinner siempre
      }
    }

    clearLocation() {
      // Eliminar animación si existe
      if (this.pulseInterval) {
        clearInterval(this.pulseInterval);
        this.pulseInterval = null;
      }

      // Eliminar círculos si existen
      if (this.userCircle) {
        this.map.removeLayer(this.userCircle);
        this.userCircle = undefined;
      }
      if (this.pulseCircle) {
        this.map.removeLayer(this.pulseCircle);
        this.pulseCircle = undefined;
      }

      // Resetear datos
      this.gpsData = null;
    }
}
