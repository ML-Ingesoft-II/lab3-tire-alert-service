import { Canal, type AccionEscalamiento, type ContextoConductor } from '../tipos';
import type { Incidente } from '../incidente/Incidente';
import type { PoliticaEscalamiento } from './PoliticaEscalamiento';

export class PoliticaParticularSolo implements PoliticaEscalamiento {
  decidirAcciones(incidente: Incidente, contexto: ContextoConductor): AccionEscalamiento[] {
    if (!contexto.contactosEmergencia || contexto.contactosEmergencia.length === 0) {
      throw new Error('El conductor particular no tiene contactos de emergencia registrados');
    }

    const textoUbicacion = incidente.ubicacion
      ? ` en (${incidente.ubicacion.latitud}, ${incidente.ubicacion.longitud})`
      : '';
    const mensaje = `Alerta de fatiga: ${incidente.tipo} detectado${textoUbicacion}`;

    return contexto.contactosEmergencia.map((telefono) => ({
      canal: Canal.SMS,
      destinatario: telefono,
      mensaje,
    }));
  }
}


