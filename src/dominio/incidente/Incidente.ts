import type { AccionEscalamiento, NivelRiesgo, TipoEvento, Ubicacion } from '../tipos';
import type { EstadoIncidente } from './estados/EstadoIncidente';
import { EstadoDetectado } from './estados/EstadoDetectado';

/**
 * PARTE 2 (incidente). PATRÓN STATE: Context.
 * Se crea con IncidenteBuilder y empieza en EstadoDetectado.
 * Delega registrarRepeticion / escalar / atender / nivel en su estado actual.
 */
export class Incidente {
  private estado: EstadoIncidente = new EstadoDetectado();
  private readonly acciones: AccionEscalamiento[] = [];

  constructor(
    readonly conductorId: string,
    readonly tipo: TipoEvento,
    readonly ocurridoEn: Date,
    readonly silenciado: boolean,
    readonly ubicacion?: Ubicacion,
  ) {}

  // --- Operaciones que usa el servicio (delegan en el estado) ---
  registrarRepeticion(): void {
    throw new Error('TODO PARTE 2: delegar en this.estado');
  }

  escalar(acciones: AccionEscalamiento[]): void {
    throw new Error('TODO PARTE 2: delegar en this.estado');
  }

  atender(): void {
    throw new Error('TODO PARTE 2: delegar en this.estado');
  }

  nivel(): NivelRiesgo {
    throw new Error('TODO PARTE 2: delegar en this.estado');
  }

  // --- Operaciones que usan los estados ---
  cambiarEstado(nuevo: EstadoIncidente): void {
    this.estado = nuevo;
  }

  agregarAcciones(acciones: AccionEscalamiento[]): void {
    this.acciones.push(...acciones);
  }

  // --- Consultas ---
  get nombreEstado(): string {
    return this.estado.nombre;
  }

  get historialAcciones(): readonly AccionEscalamiento[] {
    return this.acciones;
  }
}
