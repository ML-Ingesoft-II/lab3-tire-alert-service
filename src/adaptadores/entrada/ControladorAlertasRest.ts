import { TipoEvento, type AlertaFatiga } from '../../dominio/tipos';
import type { ProcesarAlerta, ResultadoProceso } from '../../aplicacion/puertos/entrada/ProcesarAlerta';

/**
 * Adaptador de entrada.
 * Recibe el JSON tal como llegaría desde tire_api_gateway, lo valida, lo convierte
 * en AlertaFatiga y lo entrega al puerto ProcesarAlerta.
 * JSON esperado: { conductorId, tipo: "MICROSUENO" | "CABECEO", silenciada, ocurridaEn (ISO), ubicacion? }
 */
export class ControladorAlertasRest {
  constructor(private readonly casoDeUso: ProcesarAlerta) {}

  async recibirAlerta(json: unknown): Promise<ResultadoProceso> {
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      throw new Error('El payload JSON debe ser un objeto válido.');
    }

    const payload = json as Record<string, unknown>;

    if (typeof payload.conductorId !== 'string' || payload.conductorId.trim() === '') {
      throw new Error('El campo conductorId es obligatorio y debe ser un string no vacío.');
    }

    if (typeof payload.tipo !== 'string' || !(payload.tipo in TipoEvento)) {
      throw new Error(`El campo tipo es obligatorio y debe ser un TipoEvento válido (${Object.values(TipoEvento).join(', ')}).`);
    }

    if (payload.silenciada === undefined || typeof payload.silenciada !== 'boolean') {
      throw new Error('El campo silenciada es obligatorio y debe ser un booleano.');
    }

    if (payload.ocurridaEn === undefined || payload.ocurridaEn === null) {
      throw new Error('El campo ocurridaEn es obligatorio.');
    }

    const ocurridaEn = new Date(payload.ocurridaEn as string | number | Date);
    if (isNaN(ocurridaEn.getTime())) {
      throw new Error('El campo ocurridaEn no es una fecha válida.');
    }

    let ubicacion = undefined;
    if (payload.ubicacion !== undefined && payload.ubicacion !== null) {
      if (typeof payload.ubicacion !== 'object') {
        throw new Error('El campo ubicacion debe ser un objeto.');
      }
      const u = payload.ubicacion as Record<string, unknown>;
      if (typeof u.latitud !== 'number' || typeof u.longitud !== 'number') {
        throw new Error('El campo ubicacion debe tener latitud y longitud numéricas.');
      }
      ubicacion = {
        latitud: u.latitud,
        longitud: u.longitud,
      };
    }

    const alerta: AlertaFatiga = {
      conductorId: payload.conductorId,
      tipo: payload.tipo as TipoEvento,
      silenciada: payload.silenciada,
      ocurridaEn,
      ubicacion,
    };

    return await this.casoDeUso.procesar(alerta);
  }
}

