import type { TipoEvento, Ubicacion } from '../tipos';
import { Incidente } from './Incidente';

/**
 * PATRÓN BUILDER.
 * Uso: new IncidenteBuilder().paraConductor('c1').deTipo(TipoEvento.MICROSUENO)
 *        .ocurridoEn(new Date()).silenciado(false).construir();
 * construir() debe lanzar un Error si falta conductorId, tipo u ocurridoEn.
 * La ubicación es opcional y silenciado vale false por defecto.
 */
export class IncidenteBuilder {
  private conductorId?: string;
  private tipo?: TipoEvento;
  private fecha?: Date;
  private ubicacion?: Ubicacion;
  private esSilenciado = false;

  paraConductor(id: string): this {
    this.conductorId = id;
    return this;
  }

  deTipo(tipo: TipoEvento): this {
    this.tipo = tipo;
    return this;
  }

  ocurridoEn(fecha: Date): this {
    this.fecha = fecha;
    return this;
  }

  enUbicacion(ubicacion: Ubicacion): this {
    this.ubicacion = ubicacion;
    return this;
  }

  silenciado(valor: boolean): this {
    this.esSilenciado = valor;
    return this;
  }

  construir(): Incidente {
    if (!this.conductorId || !this.tipo || !this.fecha) {
      throw new Error(
        'Faltan datos obligatorios para construir el incidente: conductorId, tipo y fecha son requeridos',
      );
    }

    return new Incidente(
      this.conductorId,
      this.tipo,
      this.fecha,
      this.esSilenciado,
      this.ubicacion,
    );
  }
}
