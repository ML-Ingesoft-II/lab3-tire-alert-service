import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Canal, TipoEvento, TipoPerfil, type AccionEscalamiento, type ContextoConductor } from '../src/dominio/tipos';
import { IncidenteBuilder } from '../src/dominio/incidente/IncidenteBuilder';
import { RepositorioIncidentesEnMemoria } from '../src/adaptadores/salida/RepositorioIncidentesEnMemoria';
import { ConsultorPerfilSimulado } from '../src/adaptadores/salida/ConsultorPerfilSimulado';
import { ClienteFcmFalso } from '../src/adaptadores/salida/externos/ClienteFcmFalso';
import { ProveedorSmsFalso } from '../src/adaptadores/salida/externos/ProveedorSmsFalso';
import { NotificadorPushFcmSimulado } from '../src/adaptadores/salida/notificadores/NotificadorPushFcmSimulado';
import { NotificadorSmsSimulado } from '../src/adaptadores/salida/notificadores/NotificadorSmsSimulado';
import { NotificadorDashboardSimulado } from '../src/adaptadores/salida/notificadores/NotificadorDashboardSimulado';
import { NotificadorConReintento } from '../src/adaptadores/salida/notificadores/NotificadorConReintento';
import type { Notificador } from '../src/aplicacion/puertos/salida/Notificador';

// Adapter (FCM, SMS), Decorator (reintento), repositorio y perfiles simulados.
function incidente(conductorId: string, ocurridoEn: string) {
  return new IncidenteBuilder()
    .paraConductor(conductorId)
    .deTipo(TipoEvento.MICROSUENO)
    .ocurridoEn(new Date(ocurridoEn))
    .construir();
}

function accion(canal: Canal, destinatario: string): AccionEscalamiento {
  return { canal, destinatario, mensaje: 'Alerta de fatiga: MICROSUENO detectado' };
}

describe('Adaptadores de salida', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {}); // los clientes falsos imprimen por consola
  });

  it('NotificadorSmsSimulado traduce la acción a sendMessage(numero, texto)', async () => {
    const proveedor = new ProveedorSmsFalso();
    await new NotificadorSmsSimulado(proveedor).enviar(accion(Canal.SMS, '+573001112233'));

    expect(proveedor.enviados).toEqual([
      { numero: '+573001112233', texto: 'Alerta de fatiga: MICROSUENO detectado' },
    ]);
  });

  it('NotificadorSmsSimulado lanza un error si el proveedor responde ok = false', async () => {
    const proveedor = new ProveedorSmsFalso(1); // falla el primer envío
    await expect(new NotificadorSmsSimulado(proveedor).enviar(accion(Canal.SMS, '+573001112233'))).rejects.toThrow();
    expect(proveedor.enviados).toHaveLength(0);
  });

  it('NotificadorPushFcmSimulado traduce la acción a send(token, { title, body })', async () => {
    const cliente = new ClienteFcmFalso();
    await new NotificadorPushFcmSimulado(cliente).enviar(accion(Canal.PUSH, 'token-copiloto-01'));

    expect(cliente.enviados).toHaveLength(1);
    expect(cliente.enviados[0].token).toBe('token-copiloto-01');
    expect(cliente.enviados[0].payload.body).toBe('Alerta de fatiga: MICROSUENO detectado');
  });

  it('NotificadorDashboardSimulado publica la acción para el despachador', async () => {
    const dashboard = new NotificadorDashboardSimulado();
    const publicada = accion(Canal.DASHBOARD, 'flota-transandina');
    await dashboard.enviar(publicada);

    expect(dashboard.publicadas).toEqual([publicada]);
  });

  it('NotificadorConReintento reintenta hasta lograr el envío cuando el proveedor falla temporalmente', async () => {
    const proveedor = new ProveedorSmsFalso(2); // falla los 2 primeros intentos
    const notificador = new NotificadorConReintento(new NotificadorSmsSimulado(proveedor), 3);

    await notificador.enviar(accion(Canal.SMS, '+573001112233'));

    expect(proveedor.enviados).toHaveLength(1);
  });

  it('NotificadorConReintento relanza el error si fallan todos los intentos', async () => {
    let llamadas = 0;
    const siempreFalla: Notificador = {
      async enviar() {
        llamadas++;
        throw new Error(`fallo ${llamadas}`);
      },
    };

    await expect(new NotificadorConReintento(siempreFalla, 3).enviar(accion(Canal.PUSH, 'token'))).rejects.toThrow('fallo 3');
    expect(llamadas).toBe(3);
  });

  it('RepositorioIncidentesEnMemoria cuenta solo los incidentes del conductor dentro de la ventana', async () => {
    const repositorio = new RepositorioIncidentesEnMemoria();
    await repositorio.guardar(incidente('c1', '2026-10-20T09:00:00Z')); // fuera de la ventana
    await repositorio.guardar(incidente('c1', '2026-10-20T10:00:00Z')); // justo en el límite: cuenta
    await repositorio.guardar(incidente('c1', '2026-10-20T10:05:00Z'));
    await repositorio.guardar(incidente('c2', '2026-10-20T10:05:00Z')); // otro conductor

    const desde = new Date('2026-10-20T10:00:00Z');

    expect(await repositorio.contarRecientes('c1', desde)).toBe(2);
    expect(await repositorio.contarRecientes('sin-incidentes', desde)).toBe(0);
    expect(repositorio.todos()).toHaveLength(4);
  });

  it('ConsultorPerfilSimulado devuelve el perfil registrado y lanza un error si no existe', async () => {
    const perfil: ContextoConductor = {
      conductorId: 'c1',
      tipoPerfil: TipoPerfil.PARTICULAR_SOLO,
      contactosEmergencia: ['+573001112233'],
    };
    const consultor = new ConsultorPerfilSimulado(new Map([['c1', perfil]]));

    expect(await consultor.obtenerContexto('c1')).toBe(perfil);
    await expect(consultor.obtenerContexto('desconocido')).rejects.toThrow(/desconocido/);
  });
});
