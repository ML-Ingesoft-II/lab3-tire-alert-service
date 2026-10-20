import { ControladorAlertasRest } from './adaptadores/entrada/ControladorAlertasRest';
import { crearServicio } from './configuracion/ConfiguracionAlertService';

/**
 * Demo: envía una alerta no silenciada por cada perfil y muestra a quién se escaló.
 * Ejecutar con: npm start
 */
async function main(): Promise<void> {
  const controlador = new ControladorAlertasRest(crearServicio());
  for (const conductorId of ['c-solo', 'c-copiloto', 'c-flota']) {
    console.log(`\nAlerta de microsueño de ${conductorId}`);
    const resultado = await controlador.recibirAlerta({
      conductorId,
      tipo: 'MICROSUENO',
      silenciada: false,
      ocurridaEn: new Date().toISOString(),
      ubicacion: { latitud: 4.65, longitud: -74.06 },
    });
    console.log(`  -> escalado: ${resultado.escalado}, nivel: ${resultado.nivel}, avisos: ${resultado.acciones.length}`);
  }
}

main().catch((error) => {
  console.error('Error en la demo:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
