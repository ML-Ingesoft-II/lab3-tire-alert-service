import { Canal, type AccionEscalamiento, type ContextoConductor } from '../tipos';
import type { Incidente } from '../incidente/Incidente';
import type { PoliticaEscalamiento } from './PoliticaEscalamiento';

export class PoliticaParticularSolo implements PoliticaEscalamiento {
  decidirAcciones(incidente: Incidente, contexto: ContextoConductor): AccionEscalamiento[] {
    if (!contexto.contactosEmergencia || contexto.contactosEmergencia.length === 0) {
      throw new Error('Solo driver has no emergency contacts registered');
    }

    const locationInfo = incidente.ubicacion
      ? ` at (${incidente.ubicacion.latitud}, ${incidente.ubicacion.longitud})`
      : '';
    const message = `Fatigue alert: ${incidente.tipo} detected${locationInfo}`;

    return contexto.contactosEmergencia.map((phoneNumber) => ({
      canal: Canal.SMS,
      destinatario: phoneNumber,
      mensaje: message,
    }));
  }
}

