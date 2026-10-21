import { describe, expect, it } from 'vitest';
import { FabricaPoliticas } from '../src/aplicacion/FabricaPoliticas';
import { ServicioEscalamiento } from '../src/aplicacion/ServicioEscalamiento';
import { ReglasEscalamiento } from '../src/dominio/ReglasEscalamiento';
import type { PoliticaEscalamiento } from '../src/dominio/politicas/PoliticaEscalamiento';
import type { Incidente } from '../src/dominio/incidente/Incidente';
import type { ConsultorPerfil } from '../src/aplicacion/puertos/salida/ConsultorPerfil';
import type { RepositorioIncidentes } from '../src/aplicacion/puertos/salida/RepositorioIncidentes';
import type { Notificador } from '../src/aplicacion/puertos/salida/Notificador';
import { Canal, TipoEvento, type AccionEscalamiento, type AlertaFatiga, type ContextoConductor, type TipoPerfil } from '../src/dominio/tipos';


describe('Abierto/cerrado', () => {
  it('Se agrega una nueva política (Strategy) sin modificar ServicioEscalamiento', async () => {
  
    const TIPO_PERFIL_TRANSPORTE_PUBLICO = 'TRANSPORTE_PUBLICO' as unknown as TipoPerfil;

    class PoliticaTransportePublico implements PoliticaEscalamiento {
      decidirAcciones(incidente: Incidente, contexto: ContextoConductor): AccionEscalamiento[] {
        return [
          {
            canal: Canal.DASHBOARD,
            destinatario: `CENTRO_CONTROL_${contexto.flotaId ?? 'SITP'}`,
            mensaje: `ALERTA TRANSPORTE PÚBLICO: Conductor ${incidente.conductorId} presentó ${incidente.tipo}`,
          },
          {
            canal: Canal.SMS,
            destinatario: 'SUPERVISOR_TURNO',
            mensaje: `Inspección requerida para unidad de transporte público del conductor ${incidente.conductorId}`,
          },
        ];
      }
    }

    //Subclase de FabricaPoliticas (Factory Method) que extiende sin modificar la original
    class FabricaPoliticasExtendida extends FabricaPoliticas {
      override crearPara(contexto: ContextoConductor): PoliticaEscalamiento {
        if (contexto.tipoPerfil === TIPO_PERFIL_TRANSPORTE_PUBLICO) {
          return new PoliticaTransportePublico();
        }
        return super.crearPara(contexto);
      }
    }

    //Configuración de dobles de prueba para el caso de uso
    const contextoTransporte: ContextoConductor = {
      conductorId: 'conductor-bus-42',
      tipoPerfil: TIPO_PERFIL_TRANSPORTE_PUBLICO,
      contactosEmergencia: ['+573009998877'],
      flotaId: 'TRANSMILENIO_ZONA_NORTE',
    };

    const consultorPerfil: ConsultorPerfil = {
      obtenerContexto: async (id: string) => {
        if (id === contextoTransporte.conductorId) return contextoTransporte;
        throw new Error('Conductor no encontrado');
      },
    };

    const incidentesGuardados: Incidente[] = [];
    const repositorio: RepositorioIncidentes = {
      guardar: async (incidente: Incidente) => {
        incidentesGuardados.push(incidente);
      },
      contarRecientes: async () => 0,
    };

    const accionesDashboard: AccionEscalamiento[] = [];
    const notificadorDashboard: Notificador = {
      enviar: async (accion) => {
        accionesDashboard.push(accion);
      },
    };

    const accionesSms: AccionEscalamiento[] = [];
    const notificadorSms: Notificador = {
      enviar: async (accion) => {
        accionesSms.push(accion);
      },
    };

    const notificadores = new Map<Canal, Notificador>([
      [Canal.DASHBOARD, notificadorDashboard],
      [Canal.SMS, notificadorSms],
    ]);

    const reglas = new ReglasEscalamiento(15, 3);
    const fabricaExtendida = new FabricaPoliticasExtendida();

    
    const servicio = new ServicioEscalamiento(
      consultorPerfil,
      repositorio,
      reglas,
      fabricaExtendida,
      notificadores,
    );

    const alerta: AlertaFatiga = {
      conductorId: 'conductor-bus-42',
      tipo: TipoEvento.MICROSUENO,
      silenciada: false, // Provoca escalamiento inmediato
      ocurridaEn: new Date(),
    };

    const resultado = await servicio.procesar(alerta);

  
    expect(resultado.escalado).toBe(true);
    expect(resultado.acciones).toHaveLength(2);
    expect(accionesDashboard).toHaveLength(1);
    expect(accionesDashboard[0].destinatario).toBe('CENTRO_CONTROL_TRANSMILENIO_ZONA_NORTE');
    expect(accionesSms).toHaveLength(1);
    expect(accionesSms[0].destinatario).toBe('SUPERVISOR_TURNO');
    expect(incidentesGuardados).toHaveLength(1);
  });
});

