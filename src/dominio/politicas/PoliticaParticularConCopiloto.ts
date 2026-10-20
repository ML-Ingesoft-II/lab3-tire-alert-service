import { Canal, type AccionEscalamiento, type ContextoConductor } from '../tipos';
import type { Incidente } from '../incidente/Incidente';
import type { PoliticaEscalamiento } from './PoliticaEscalamiento';

export class PoliticaParticularConCopiloto implements PoliticaEscalamiento {
  decidirAcciones(incidente: Incidente, contexto: ContextoConductor): AccionEscalamiento[] {
    if (!contexto.copilotoId || contexto.copilotoId.trim() === '') {
      throw new Error('Driver with copilot has no copilotId registered');
    }

    const locationInfo = incidente.ubicacion
      ? ` at (${incidente.ubicacion.latitud}, ${incidente.ubicacion.longitud})`
      : '';
    const message = `Fatigue alert: ${incidente.tipo} detected${locationInfo}`;

    return [
      {
        canal: Canal.PUSH,
        destinatario: contexto.copilotoId,
        mensaje: message,
      },
    ];
  }
}

