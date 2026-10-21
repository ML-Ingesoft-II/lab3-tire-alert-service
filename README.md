# Laboratorio: del sector profesional al código

*Ingeniería de Software II – Universidad Nacional de Colombia, 2026-2.*

## Integrantes

- Deivid Farid Ardila Herrera - [deardilah@unal.edu.co](mailto:deardilah@unal.edu.co)
- Ángel David Beltrán García - [anbeltrang@unal.edu.co](mailto:anbeltrang@unal.edu.co)
- Oscar Iván Ulises Gutiérrez Palacios - [osgutierrezp@unal.edu.co](mailto:osgutierrezp@unal.edu.co)
- Juan Camilo Vergara Tao - [juvergarat@unal.edu.co](mailto:juvergarat@unal.edu.co)

> [!IMPORTANT]
> El informe completo del laboratorio se encuentra disponible [aquí](docs/Lab_Patrones_Grupo04.pdf).

Este repositorio contiene `tire_alert_service`, el componente del sistema **Tire** (detección de fatiga y microsueño en conductores) que se encarga de las alertas que la alarma de cabina no logró resolver. Según el perfil del conductor, decide a quién escalar cada alerta (RF08) y deja registrado el incidente (AC06).

Está escrito en TypeScript sobre Node.js 22 o superior, con pruebas unitarias en Vitest. Sigue una sub-arquitectura hexagonal (puertos y adaptadores), y la estructura de carpetas lo refleja. Como el laboratorio no exige infraestructura real, el repositorio de incidentes vive en memoria y los servicios externos (perfiles, FCM y SMS) están simulados.

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
| | | ConcreteCreator | Subclase `FabricaPoliticasExtendida` en `tests/abierto-cerrado.test.ts` (prueba de abierto/cerrado) |
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
| Arquitectura macro (fase 2) | [`docs/diagramas/fase2-arquitectura-macro.svg`](docs/diagramas/fase2-arquitectura-macro.svg) |
| Sub-arquitectura hexagonal (fase 3) | [`docs/diagramas/fase3-sub-arquitectura.svg`](docs/diagramas/fase3-sub-arquitectura.svg) |
| Diagrama de clases base (fase 4) | [`docs/diagramas/fase4-clases-base.svg`](docs/diagramas/fase4-clases-base.svg) |
| Diagrama de clases con patrones (fase 5) | [`docs/diagramas/fase5-clases-patrones.svg`](docs/diagramas/fase5-clases-patrones.svg) |
| Strategy | [`docs/diagramas/fase5-strategy.svg`](docs/diagramas/fase5-strategy.svg) |
| Factory Method | [`docs/diagramas/fase5-factory-method.svg`](docs/diagramas/fase5-factory-method.svg) |
| State | [`docs/diagramas/fase5-state.svg`](docs/diagramas/fase5-state.svg) |
| Builder | [`docs/diagramas/fase5-builder.svg`](docs/diagramas/fase5-builder.svg) |
| Adapter | [`docs/diagramas/fase5-adapter.svg`](docs/diagramas/fase5-adapter.svg) |
| Decorator | [`docs/diagramas/fase5-decorator.svg`](docs/diagramas/fase5-decorator.svg) |
