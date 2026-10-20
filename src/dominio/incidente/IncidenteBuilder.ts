import type { TipoEvento, Ubicacion } from '../tipos';
import { Incidente } from './Incidente';

/**
 * PARTE 2 (incidente). PATRÓN BUILDER.
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
    throw new Error('TODO PARTE 2: IncidenteBuilder.paraConductor');
  }

  deTipo(tipo: TipoEvento): this {
    throw new Error('TODO PARTE 2: IncidenteBuilder.deTipo');
  }

  ocurridoEn(fecha: Date): this {
    throw new Error('TODO PARTE 2: IncidenteBuilder.ocurridoEn');
  }

  enUbicacion(ubicacion: Ubicacion): this {
    throw new Error('TODO PARTE 2: IncidenteBuilder.enUbicacion');
  }

  silenciado(valor: boolean): this {
    throw new Error('TODO PARTE 2: IncidenteBuilder.silenciado');
  }

  construir(): Incidente {
    throw new Error('TODO PARTE 2: IncidenteBuilder.construir (validar obligatorios)');
  }
}
