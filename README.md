# tire_alert_service – Lab 3: del sector profesional al código

Ingeniería de Software II – Universidad Nacional de Colombia, 2026-2.
Integrantes: Deivid Farid Ardila Herrera, Ángel David Beltrán García, Oscar Iván Ulises Gutiérrez Palacios, Juan Camilo Vergara Tao.

Componente `tire_alert_service` del sistema **Tire** (detección de fatiga y microsueño en conductores).
Recibe las alertas de fatiga que la alarma de cabina no logró resolver y decide a quién escalar
según el perfil del conductor (RF08), registrando cada incidente (AC06).

- **Lenguaje:** TypeScript (Node.js 22 o superior).
- **Pruebas:** Vitest.
- **Sub-arquitectura:** hexagonal (puertos y adaptadores). La estructura de carpetas la refleja.
- Sin base de datos ni servicios reales: repositorio en memoria y clientes externos simulados.

## Cómo ejecutar

Requisitos: [Node.js LTS](https://nodejs.org/) (incluye `npm`) y Git.

```bash
npm install        # instala TypeScript, Vitest y tsx (solo dentro del proyecto)
npm start          # ejecuta la demo (src/main.ts)
npm test           # ejecuta las pruebas unitarias
npm run typecheck  # revisa los tipos sin ejecutar
```

## Estructura del proyecto

```
src/
  dominio/                    Núcleo: reglas del negocio, sin dependencias externas
    tipos.ts                  Tipos compartidos (AlertaFatiga, ContextoConductor, AccionEscalamiento…)
    ReglasEscalamiento.ts     Cuándo escalar
    incidente/                Incidente (State) e IncidenteBuilder (Builder)
    politicas/                Políticas de escalamiento por perfil (Strategy)
  aplicacion/
    ServicioEscalamiento.ts   Caso de uso principal
    FabricaPoliticas.ts       Elige la política según el perfil (Factory Method)
    puertos/entrada/          ProcesarAlerta
    puertos/salida/           ConsultorPerfil, RepositorioIncidentes, Notificador
  adaptadores/
    entrada/                  ControladorAlertasRest
    salida/                   Notificadores (Adapter, Decorator), repositorio y perfiles simulados
      externos/               Clientes falsos de FCM y SMS (los "adaptados")
  configuracion/              ConfiguracionAlertService: único lugar donde se conectan las piezas
  main.ts                     Demo
tests/                        Pruebas unitarias (Vitest), incluida la de abierto/cerrado
docs/diagramas/               Diagramas del informe (PNG, SVG, PlantUML y draw.io)
```

## Patrones de diseño → archivo

| Familia | Patrón | Rol | Archivo / clase |
|---|---|---|---|
| Comportamiento | Strategy | Strategy | `src/dominio/politicas/PoliticaEscalamiento.ts` |
| | | ConcreteStrategy | `src/dominio/politicas/PoliticaParticularSolo.ts`, `PoliticaParticularConCopiloto.ts`, `PoliticaFlota.ts` |
| | | Context | `src/aplicacion/ServicioEscalamiento.ts` |
| Creacional | Factory Method | Creator | `src/aplicacion/FabricaPoliticas.ts` (`crearPara`) |
| Comportamiento | State | State / ConcreteState | `src/dominio/incidente/estados/` |
| | | Context | `src/dominio/incidente/Incidente.ts` |
| Creacional | Builder | Builder / Product | `src/dominio/incidente/IncidenteBuilder.ts` / `Incidente.ts` |
| Estructural | Adapter | Target | `src/aplicacion/puertos/salida/Notificador.ts` |
| | | Adapter | `src/adaptadores/salida/notificadores/NotificadorPushFcmSimulado.ts`, `NotificadorSmsSimulado.ts` |
| | | Adaptee | `src/adaptadores/salida/externos/ClienteFcmFalso.ts`, `ProveedorSmsFalso.ts` |
| Estructural | Decorator | Decorator | `src/adaptadores/salida/notificadores/NotificadorConReintento.ts` |

## Diagramas

| Diagrama | Archivo |
|---|---|
| Arquitectura macro (fase 2) | [`docs/diagramas/fase2-arquitectura-macro.drawio`](docs/diagramas/fase2-arquitectura-macro.drawio) |
| Sub-arquitectura hexagonal (fase 3) | [`docs/diagramas/fase3-sub-arquitectura.drawio`](docs/diagramas/fase3-sub-arquitectura.drawio) |
| Diagrama de clases base (fase 4) | [`docs/diagramas/fase4-clases-base.png`](docs/diagramas/fase4-clases-base.png) |
| Diagrama de clases con patrones (fase 5) | [`docs/diagramas/fase5-clases-patrones.png`](docs/diagramas/fase5-clases-patrones.png) |
| Strategy | [`docs/diagramas/fase5-strategy.png`](docs/diagramas/fase5-strategy.png) |
| Factory Method | [`docs/diagramas/fase5-factory-method.png`](docs/diagramas/fase5-factory-method.png) |
| State | [`docs/diagramas/fase5-state.png`](docs/diagramas/fase5-state.png) |
| Builder | [`docs/diagramas/fase5-builder.png`](docs/diagramas/fase5-builder.png) |
| Adapter | [`docs/diagramas/fase5-adapter.png`](docs/diagramas/fase5-adapter.png) |
| Decorator | [`docs/diagramas/fase5-decorator.png`](docs/diagramas/fase5-decorator.png) |
