import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private isDbReady = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  /**
   * Inicializa la base de datos (idempotente)
   */
  async initDB(): Promise<void> {
    try {
      if (this.isDbReady) {
        return;
      }

      // Crear/abrir conexión
      this.db = await this.sqlite.createConnection(
        'my_db',
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();

      // Crear tabla acorde a tu polygonForm
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS poligonos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dni TEXT NOT NULL,
          apellido_paterno TEXT NOT NULL,
          apellido_materno TEXT NOT NULL,
          nombres TEXT NOT NULL,
          fecha_de_nacimiento TEXT NOT NULL,
          organizacion TEXT NOT NULL,
          participante TEXT NOT NULL,
          cultivo TEXT NOT NULL,
          coordenadas TEXT,
          fotos TEXT
        );
      `);

      this.isDbReady = true;
      console.log('✅ DB inicializada');
    } catch (err) {
      console.error('❌ Error initDB:', err);
      throw err;
    }
  }

  /**
   * Inserta un polígono y devuelve el id insertado (poligonoId)
   */
  async addPoligono(formValue: any, coords: string): Promise<number | null> {
    try {
      // Asegurar DB inicializada
      if (!this.isDbReady) {
        await this.initDB();
      }

      const sql = `
        INSERT INTO poligonos
          (dni, apellido_paterno, apellido_materno, nombres, fecha_de_nacimiento,
           organizacion, participante, cultivo, coordenadas, fotos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      const values = [
        formValue.dni,
        formValue.apellido_paterno,
        formValue.apellido_materno,
        formValue.nombres,
        formValue.fecha_de_nacimiento,
        formValue.organizacion,
        formValue.participante,
        formValue.cultivo,
        coords,
        JSON.stringify(formValue.fotos || [])
      ];

      // executeSet es más compatible para ejecutar statements con valores
      await this.db.executeSet([
        { statement: sql, values }
      ]);

      // Obtener last inserted id
      const res = await this.db.query(`SELECT last_insert_rowid() AS id;`);
      const poligonoId = (res.values && res.values[0] && (res.values[0].id ?? res.values[0]['last_insert_rowid()'])) ? (res.values[0].id ?? res.values[0]['last_insert_rowid()']) : null;

      console.log('✅ Polígono guardado en SQLite, id=', poligonoId);
      return poligonoId;
    } catch (err) {
      console.error('❌ Error al guardar polígono:', err);
      throw err; // re-lanzar para que la UI/Modal lo maneje
    }
  }

  /**
   * Obtener todos los polígonos (fotos vienen como JSON string)
   */
  async getPoligonos(): Promise<any[]> {
    try {
      if (!this.isDbReady) {
        await this.initDB();
      }
      const res = await this.db.query('SELECT * FROM poligonos;');
      return res.values || [];
    } catch (err) {
      console.error('❌ Error al obtener polígonos:', err);
      return [];
    }
  }

  /**
   * Método de utilidad para borrar la BD (solo pruebas)
   */
  async clearPoligonos(): Promise<void> {
    try {
      if (!this.isDbReady) {
        await this.initDB();
      }
      await this.db.execute('DELETE FROM poligonos;'); // ✅ usar string directo
      console.log('🗑️ Todos los polígonos eliminados');
    } catch (err) {
      console.error('❌ Error al limpiar tabla:', err);
      throw err;
    }
  }

}
