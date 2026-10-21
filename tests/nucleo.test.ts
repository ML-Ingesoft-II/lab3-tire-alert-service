import { describe, expect, it } from 'vitest';
import { Canal, TipoEvento, TipoPerfil, type AccionEscalamiento, type AlertaFatiga, type ContextoConductor } from '../src/dominio/tipos';
import { ReglasEscalamiento } from '../src/dominio/ReglasEscalamiento';
import { FabricaPoliticas } from '../src/aplicacion/FabricaPoliticas';
import { PoliticaParticularSolo } from '../src/dominio/politicas/PoliticaParticularSolo';
import { PoliticaParticularConCopiloto } from '../src/dominio/politicas/PoliticaParticularConCopiloto';
import { PoliticaFlota } from '../src/dominio/politicas/PoliticaFlota';
import { ServicioEscalamiento } from '../src/aplicacion/ServicioEscalamiento';
import type { ConsultorPerfil } from '../src/aplicacion/puertos/salida/ConsultorPerfil';
import type { RepositorioIncidentes } from '../src/aplicacion/puertos/salida/RepositorioIncidentes';
import type { Notificador } from '../src/aplicacion/puertos/salida/Notificador';
import type { Incidente } from '../src/dominio/incidente/Incidente';

class ConsultorPerfilStub implements ConsultorPerfil {
  constructor(private readonly perfiles: Map<string, ContextoConductor>) {}

  async obtenerContexto(conductorId: string): Promise<ContextoConductor> {
    const perfil = this.perfiles.get(conductorId);
    if (!perfil) {
      throw new Error(`Perfil no encontrado para el conductor: ${conductorId}`);
    }
    return perfil;
  }
}

class RepositorioIncidentesSpy implements RepositorioIncidentes {
  readonly guardados: Incidente[] = [];

  constructor(private readonly conteoRecientes: number = 0) {}

  async guardar(incidente: Incidente): Promise<void> {
    this.guardados.push(incidente);
  }

  async contarRecientes(conductorId: string, desde: Date): Promise<number> {
    return this.conteoRecientes;
  }
}

class NotificadorSpy implements Notificador {
  readonly accionesEnviadas: AccionEscalamiento[] = [];

  async enviar(accion: AccionEscalamiento): Promise<void> {
    this.accionesEnviadas.push(accion);
  }
}

describe('Núcleo', () => {
  it('ReglasEscalamiento escala cuando la alarma no fue silenciada', () => {
    const reglas = new ReglasEscalamiento(10, 3);
    const incidente = { silenciado: false } as Incidente;
    expect(reglas.debeEscalar(incidente, 0)).toBe(true);
  });

  it('ReglasEscalamiento escala cuando se alcanza el umbral de repeticiones aunque se haya silenciado', () => {
    const reglas = new ReglasEscalamiento(10, 3);
    const incidente = { silenciado: true } as Incidente;
    expect(reglas.debeEscalar(incidente, 2)).toBe(true);
    expect(reglas.debeEscalar(incidente, 1)).toBe(false);
  });

  it('FabricaPoliticas devuelve la política correcta para cada TipoPerfil', () => {
    const fabrica = new FabricaPoliticas();

    const politicaSolo = fabrica.crearPara({
      conductorId: 'c-solo',
      tipoPerfil: TipoPerfil.PARTICULAR_SOLO,
      contactosEmergencia: ['+12345'],
    });
    expect(politicaSolo).toBeInstanceOf(PoliticaParticularSolo);

    const politicaCopiloto = fabrica.crearPara({
      conductorId: 'c-copiloto',
      tipoPerfil: TipoPerfil.PARTICULAR_CON_COPILOTO,
      contactosEmergencia: [],
      copilotoId: 'token-copiloto',
    });
    expect(politicaCopiloto).toBeInstanceOf(PoliticaParticularConCopiloto);

    const politicaFlota = fabrica.crearPara({
      conductorId: 'c-flota',
      tipoPerfil: TipoPerfil.FLOTA,
      contactosEmergencia: [],
      flotaId: 'flota-1',
    });
    expect(politicaFlota).toBeInstanceOf(PoliticaFlota);
  });

  it('PoliticaParticularSolo genera un SMS por cada contacto de emergencia', () => {
    const politica = new PoliticaParticularSolo();
    const incidente = {
      tipo: TipoEvento.MICROSUENO,
      ubicacion: { latitud: 4.65, longitud: -74.06 },
    } as Incidente;
    const contexto: ContextoConductor = {
      conductorId: 'c-solo',
      tipoPerfil: TipoPerfil.PARTICULAR_SOLO,
      contactosEmergencia: ['+573001112233', '+573004445566'],
    };

    const acciones = politica.decidirAcciones(incidente, contexto);
    expect(acciones).toHaveLength(2);
    expect(acciones[0]).toEqual({
      canal: Canal.SMS,
      destinatario: '+573001112233',
      mensaje: expect.stringContaining('MICROSUENO'),
    });
    expect(acciones[1].destinatario).toBe('+573004445566');
  });

  it('ServicioEscalamiento envía cada acción por el notificador de su canal y guarda el incidente', async () => {
    const perfil: ContextoConductor = {
      conductorId: 'c-solo',
      tipoPerfil: TipoPerfil.PARTICULAR_SOLO,
      contactosEmergencia: ['+573001112233'],
    };
    const perfiles = new ConsultorPerfilStub(new Map([[perfil.conductorId, perfil]]));
    const repositorio = new RepositorioIncidentesSpy(0);
    const notificadorSms = new NotificadorSpy();
    const notificadores = new Map<Canal, Notificador>([[Canal.SMS, notificadorSms]]);

    const servicio = new ServicioEscalamiento(
      perfiles,
      repositorio,
      new ReglasEscalamiento(10, 3),
      new FabricaPoliticas(),
      notificadores,
    );

    const alerta: AlertaFatiga = {
      conductorId: 'c-solo',
      tipo: TipoEvento.MICROSUENO,
      silenciada: false,
      ocurridaEn: new Date(),
    };

    const resultado = await servicio.procesar(alerta);

    expect(resultado.escalado).toBe(true);
    expect(notificadorSms.accionesEnviadas).toHaveLength(1);
    expect(notificadorSms.accionesEnviadas[0].destinatario).toBe('+573001112233');
    expect(repositorio.guardados).toHaveLength(1);
  });

  it('ServicioEscalamiento no notifica cuando la alerta fue silenciada y no hay repeticiones', async () => {
    const perfil: ContextoConductor = {
      conductorId: 'c-solo',
      tipoPerfil: TipoPerfil.PARTICULAR_SOLO,
      contactosEmergencia: ['+573001112233'],
    };
    const perfiles = new ConsultorPerfilStub(new Map([[perfil.conductorId, perfil]]));
    const repositorio = new RepositorioIncidentesSpy(0);
    const notificadorSms = new NotificadorSpy();
    const notificadores = new Map<Canal, Notificador>([[Canal.SMS, notificadorSms]]);

    const servicio = new ServicioEscalamiento(
      perfiles,
      repositorio,
      new ReglasEscalamiento(10, 3),
      new FabricaPoliticas(),
      notificadores,
    );

    const alerta: AlertaFatiga = {
      conductorId: 'c-solo',
      tipo: TipoEvento.MICROSUENO,
      silenciada: true,
      ocurridaEn: new Date(),
    };

    const resultado = await servicio.procesar(alerta);

    expect(resultado.escalado).toBe(false);
    expect(notificadorSms.accionesEnviadas).toHaveLength(0);
    expect(resultado.acciones).toHaveLength(0);
    expect(repositorio.guardados).toHaveLength(1);
  });
});


