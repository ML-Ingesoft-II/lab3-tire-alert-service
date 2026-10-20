import { TipoPerfil, type ContextoConductor } from '../dominio/tipos';
import type { PoliticaEscalamiento } from '../dominio/politicas/PoliticaEscalamiento';
import { PoliticaParticularSolo } from '../dominio/politicas/PoliticaParticularSolo';
import { PoliticaParticularConCopiloto } from '../dominio/politicas/PoliticaParticularConCopiloto';
import { PoliticaFlota } from '../dominio/politicas/PoliticaFlota';

export class FabricaPoliticas {
  crearPara(contexto: ContextoConductor): PoliticaEscalamiento {
    switch (contexto.tipoPerfil) {
      case TipoPerfil.PARTICULAR_SOLO:
        return new PoliticaParticularSolo();
      case TipoPerfil.PARTICULAR_CON_COPILOTO:
        return new PoliticaParticularConCopiloto();
      case TipoPerfil.FLOTA:
        return new PoliticaFlota();
      default:
        throw new Error(`Unsupported profile type: ${(contexto as ContextoConductor).tipoPerfil}`);
    }
  }
}

