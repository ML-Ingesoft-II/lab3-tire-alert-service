import { TipoPerfil, type ContextoConductor } from '../dominio/tipos';
import type { PoliticaEscalamiento } from '../dominio/politicas/PoliticaEscalamiento';

/**
 * PARTE 1 (núcleo). PATRÓN FACTORY METHOD: Creator.
 * crearPara() mira contexto.tipoPerfil y devuelve la política correspondiente.
 * Es el ÚNICO lugar que conoce las políticas concretas.
 */
export class FabricaPoliticas {
  crearPara(contexto: ContextoConductor): PoliticaEscalamiento {
    // TODO PARTE 1: switch sobre contexto.tipoPerfil (TipoPerfil.PARTICULAR_SOLO, ...).
    // Si el perfil no se reconoce, lanzar un Error.
    throw new Error('TODO PARTE 1: FabricaPoliticas.crearPara');
  }
}
