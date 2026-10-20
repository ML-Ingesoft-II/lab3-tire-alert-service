import type { AccionEscalamiento, ContextoConductor } from '../tipos';
import type { Incidente } from '../incidente/Incidente';

/**
 * PATRÓN STRATEGY: interfaz Strategy.
 * Cada perfil de conductor decide a quién avisar y por qué canal (RF08).
 */
export interface PoliticaEscalamiento {
  decidirAcciones(incidente: Incidente, contexto: ContextoConductor): AccionEscalamiento[];
}
