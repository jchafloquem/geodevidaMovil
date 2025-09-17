import { Component } from '@angular/core';
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
import 'leaflet-draw';


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
    IonLoading,
  ],
})
export class MapaPage {
  private map!: L.Map;
  private userCircle?: L.Circle;
  private pulseCircle?: L.Circle;
  private pulseInterval?: any;
  private drawnItems = new L.FeatureGroup();

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

  // En Ionic, mejor que ngAfterViewInit
  ionViewDidEnter(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-9.19, -75.0152],
      zoomControl: false,
      zoom: 5,
    });


    // Mapas base
    const lightLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: 'DEVIDA', maxZoom: 19 }
    );
    const satelliteLayer = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      { attribution: 'DEVIDA', maxZoom: 20 }
    );
    satelliteLayer.addTo(this.map);

    L.control
      .layers(
        { Satellite: satelliteLayer, Light: lightLayer },
        undefined,
        { collapsed: true ,position: 'topright' }
      )
      .addTo(this.map);

    // Barra de escala
    L.control
      .scale({
        position: 'topleft',
        metric: true,
        imperial: false,
        maxWidth: 100,
      })
      .addTo(this.map);

    // Leaflet Draw
    this.map.addLayer(this.drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      edit: {
        featureGroup: this.drawnItems,
        remove: true,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            color: '#ff0000', // Rojo
            fillColor: '#ff0000', // Rojo
            fillOpacity: 0.2, // Ligera transparencia
            weight: 3, // Borde más grueso
          },
        },
        rectangle: {
          shapeOptions: {
            color: '#ff0000',
            fillColor: '#ff0000',
            fillOpacity: 0.2,
            weight: 3,
          },
        },
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });

    this.map.addControl(drawControl);
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      this.drawnItems.addLayer(layer);

      const geojson = layer.toGeoJSON();
      console.log('Polígono dibujado:', geojson);
    });

    // ✅ Forzar recalculo después de añadir controles
    this.map.on('layeradd', () => {
      this.map.invalidateSize();
    });

    // ✅ Recalcular al cambiar el tamaño de pantalla
    window.addEventListener('resize', () => {
      this.map.invalidateSize();
    });

    // Refuerzo inicial
    setTimeout(() => {
      this.map.invalidateSize();
    }, 400);
  }

  // Geolocalización con spinner
  async locateUser() {
    this.isLoading = true;
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      const { latitude, longitude, altitude, accuracy, altitudeAccuracy, speed } =
        coordinates.coords;

      this.gpsData = {
        lat: latitude ? parseFloat(latitude.toFixed(4)) : 0,
        lng: longitude ? parseFloat(longitude.toFixed(4)) : 0,
        alt: altitude ? parseFloat(altitude.toFixed(4)) : 0,
        vel: speed ? parseFloat(speed.toFixed(2)) : 0,
        accH: accuracy ? parseFloat(accuracy.toFixed(4)) : 0,
        accV: altitudeAccuracy ? parseFloat(altitudeAccuracy.toFixed(2)) : 0,
      };

      const lat = latitude;
      const lng = longitude;

      if (this.userCircle) {
        this.userCircle.setLatLng([lat, lng]);
        if (this.pulseCircle) this.pulseCircle.setLatLng([lat, lng]);
      } else {
        this.userCircle = L.circle([lat, lng], {
          color: '#ffff',
          fillColor: '#0D9BD7',
          fillOpacity: 1,
          radius: 3,
          weight: 1,
        }).addTo(this.map);

        this.pulseCircle = L.circle([lat, lng], {
          color: '#0DA642',
          fillColor: '#3880ff',
          fillOpacity: 0.3,
          radius: 3,
          weight: 0,
        }).addTo(this.map);

        let radius = 3;
        const maxRadius = 50;

        this.pulseInterval = setInterval(() => {
          if (!this.pulseCircle) return;
          radius += 1;
          if (radius >= maxRadius) radius = 3;
          this.pulseCircle.setRadius(radius);
          const opacity = 0.6 * (maxRadius - radius) / maxRadius;
          this.pulseCircle.setStyle({ fillOpacity: opacity });
        }, 50);
      }
      this.map.setView([lat, lng], 19);
    } catch (error) {
      console.error('Error obteniendo ubicación', error);
    } finally {
      this.isLoading = false;
    }
  }

  clearLocation() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
    if (this.userCircle) {
      this.map.removeLayer(this.userCircle);
      this.userCircle = undefined;
    }
    if (this.pulseCircle) {
      this.map.removeLayer(this.pulseCircle);
      this.pulseCircle = undefined;
    }
  }
}
