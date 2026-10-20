import type { AccionEscalamiento, ContextoConductor } from '../tipos';
import type { Incidente } from '../incidente/Incidente';
import type { PoliticaEscalamiento } from './PoliticaEscalamiento';

/**
 * PARTE 1 (núcleo). PATRÓN STRATEGY: estrategia concreta.
 * Una acción Canal.SMS por cada número en contexto.contactosEmergencia.
 * El mensaje debe incluir el tipo de evento y, si existe, la ubicación.
 * Si el perfil no tiene a quién avisar (dato vacío o ausente), lanzar un Error.
 */
export class PoliticaParticularSolo implements PoliticaEscalamiento {
  decidirAcciones(incidente: Incidente, contexto: ContextoConductor): AccionEscalamiento[] {
    throw new Error('TODO PARTE 1: PoliticaParticularSolo.decidirAcciones');
  }
}
