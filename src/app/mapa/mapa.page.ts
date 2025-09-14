import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
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
    IonToolbar,
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
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'DEVIDA', maxZoom: 19 }
    );
    lightLayer.addTo(this.map);
    L.control.layers(
      { 'Light': lightLayer, 'Satellite': satelliteLayer },
      undefined, // no overlays por ahora
      { collapsed: true } // mostrar siempre el control
    ).addTo(this.map);
    // --- AQUI AGREGAMOS LA BARRA DE ESCALA ---
    L.control.scale({
      position: 'bottomleft', // puedes usar 'bottomright', 'topleft', 'topright'
      metric: true,           // metros/kilómetros
      imperial: false,        // desactiva pies/millas si no quieres
      maxWidth: 100           // ancho máximo en píxeles
    }).addTo(this.map);
    // Importante: forzar actualización del tamaño del mapa
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }
    // Geolocalizacion
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
            color: '#ffff',
            fillColor: '#0D9BD7',
            fillOpacity: 1,
            radius: 3,
            weight: 1
          }).addTo(this.map).bindPopup('📍 Estás aquí').openPopup();;
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
          this.pulseInterval = setInterval(() => {
            if (!this.pulseCircle) return;

            if (growing) {
              radius += 2;
              if (radius >= 50) growing = false;
            } else {
              radius -= 2;
              if (radius <= 3) growing = true;
            }
            this.pulseCircle.setRadius(radius);
            const opacity = 0.3 * (50 - radius) / 40 + 0.1;
            this.pulseCircle.setStyle({ fillOpacity: opacity });
          }, 50);
        }
        this.map.setView([lat, lng], 19);
      } catch (error) {
        console.error('Error obteniendo ubicación', error);
      }
    }
}
