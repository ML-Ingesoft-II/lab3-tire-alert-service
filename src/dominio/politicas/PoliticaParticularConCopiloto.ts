import { Canal, type AccionEscalamiento, type ContextoConductor } from '../tipos';
import type { Incidente } from '../incidente/Incidente';
import type { PoliticaEscalamiento } from './PoliticaEscalamiento';

/**
 * PATRÓN STRATEGY: estrategia concreta.
 * Una acción Canal.PUSH dirigida al dispositivo del copiloto.
 */
export class PoliticaParticularConCopiloto implements PoliticaEscalamiento {
  decidirAcciones(incidente: Incidente, contexto: ContextoConductor): AccionEscalamiento[] {
    if (!contexto.copilotoId || contexto.copilotoId.trim() === '') {
      throw new Error('El conductor con copiloto no tiene un copilotoId registrado');
    }

    const textoUbicacion = incidente.ubicacion
      ? ` en (${incidente.ubicacion.latitud}, ${incidente.ubicacion.longitud})`
      : '';
    const mensaje = `Alerta de fatiga: ${incidente.tipo} detectado${textoUbicacion}`;

    return [
      {
        canal: Canal.PUSH,
        destinatario: contexto.copilotoId,
        mensaje,
      },
    ];
  }
}


