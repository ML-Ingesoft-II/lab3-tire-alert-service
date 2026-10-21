# Laboratorio: del sector profesional al código

*Ingeniería de Software II – Universidad Nacional de Colombia, 2026-2.*

## Integrantes

- Deivid Farid Ardila Herrera - [deardilah@unal.edu.co](mailto:deardilah@unal.edu.co)
- Ángel David Beltrán García - [anbeltrang@unal.edu.co](mailto:anbeltrang@unal.edu.co)
- Oscar Iván Ulises Gutiérrez Palacios - [osgutierrezp@unal.edu.co](mailto:osgutierrezp@unal.edu.co)
- Juan Camilo Vergara Tao - [juvergarat@unal.edu.co](mailto:juvergarat@unal.edu.co)

> [!IMPORTANT]
> El informe completo del laboratorio se encuentra disponible [aquí](URL).

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

## Plan detallado de desarrollo por fases

Para guiar el desarrollo continuo del laboratorio, a continuación se desglosan las cuatro partes del proyecto, sus responsabilidades, reglas de negocio y lineamientos de implementación.

> [!NOTE]
> **Convenciones de código:** El código fuente (nombres de variables, mensajes de error, mensajes de notificación y comentarios concisos) se escribe en **español** para mantener coherencia con el dominio y la documentación del proyecto. Las firmas públicas y nombres de interfaces definidos en la plantilla base no deben alterarse para mantener compatibilidad con los diagramas y el ensamble general.


---

### Parte 1 – Núcleo de Decisión (`Strategy`, `Factory Method`)
**Estado:** ✅ *Completada*

- **[`src/dominio/ReglasEscalamiento.ts`](src/dominio/ReglasEscalamiento.ts):**
  - Implementa la condición de escalamiento: la alerta escala si la alarma no fue silenciada en cabina (`!incidente.silenciado`) **o** si el conteo de incidentes recientes dentro de la ventana configurada alcanza el umbral (`recientes + 1 >= this.umbralRepeticiones`).
- **[`src/dominio/politicas/`](src/dominio/politicas/) (Patrón Strategy):**
  - `PoliticaParticularSolo.ts`: Genera una acción `Canal.SMS` por cada número en `contexto.contactosEmergencia`. Valida que existan contactos o lanza `Error`.
  - `PoliticaParticularConCopiloto.ts`: Genera una acción `Canal.PUSH` dirigida a `contexto.copilotoId`. Valida la presencia de dicho identificador.
  - `PoliticaFlota.ts`: Genera una acción `Canal.DASHBOARD` dirigida al despachador de la flota identificado por `contexto.flotaId`.
  - Todas las políticas formatean el mensaje con el tipo de evento y la ubicación si existe.
- **[`src/aplicacion/FabricaPoliticas.ts`](src/aplicacion/FabricaPoliticas.ts) (Patrón Factory Method):**
  - Centraliza la selección de la política concreta según `contexto.tipoPerfil` mediante un `switch`, aislando al caso de uso de las clases concretas.
- **[`src/aplicacion/ServicioEscalamiento.ts`](src/aplicacion/ServicioEscalamiento.ts) (Caso de Uso / Context):**
  - Coordina la creación del incidente (`IncidenteBuilder`), la consulta de reiteraciones previas y la evaluación con `ReglasEscalamiento`.
  - Transiciona el estado del incidente a crítico (`incidente.escalar(acciones)`) **antes** de despachar por red.
  - Despacha cada acción por el notificador de su canal.
  - En un bloque `try ... finally`, garantiza que `repositorio.guardar(incidente)` se invoque **siempre**, cumpliendo con la auditabilidad y trazabilidad requeridas por **AC06**.
- **Pruebas:** [`tests/nucleo.test.ts`](tests/nucleo.test.ts) valida los 6 casos de negocio mediante dobles de prueba (*stubs* y *spies*).

---

### Parte 2 – Incidente y Ciclo de Vida (`State`, `Builder`)
**Estado:** ✅ *Completada*

*Objetivo:* Modelar la entidad central del dominio, sus transiciones de estado de riesgo y su construcción segura.

- **Patrón State ([`src/dominio/incidente/estados/`](src/dominio/incidente/estados/)):**
  - Todas las clases implementan `EstadoIncidente` (`nombre`, `registrarRepeticion`, `escalar`, `atender`, `nivel`).
  - `EstadoDetectado.ts`:
    - Estado inicial del incidente.
    - `nivel()` retorna `NivelRiesgo.PRECAUCION`.
    - `registrarRepeticion(incidente)`: No altera el estado.
    - `escalar(incidente, acciones)`: Llama a `incidente.agregarAcciones(acciones)` y transiciona con `incidente.cambiarEstado(new EstadoEscalado())`.
    - `atender(incidente)`: Transiciona a `new EstadoAtendido()`.
  - `EstadoEscalado.ts`:
    - Estado crítico.
    - `nivel()` retorna `NivelRiesgo.CRITICO`.
    - `registrarRepeticion(incidente)`: Permanece en `EstadoEscalado`.
    - `escalar(incidente, acciones)`: Acumula las nuevas acciones con `incidente.agregarAcciones(acciones)`.
    - `atender(incidente)`: Transiciona a `new EstadoAtendido()`.
  - `EstadoAtendido.ts`:
    - Estado terminal/cerrado.
    - `nivel()` retorna `NivelRiesgo.NORMAL`.
    - `registrarRepeticion`, `escalar` y `atender`: Operaciones vacías (*no-op*), impidiendo que un incidente resuelto vuelva a notificar o escalar.
- **Contexto State ([`src/dominio/incidente/Incidente.ts`](src/dominio/incidente/Incidente.ts)):**
  - Inicia con `this.estado = new EstadoDetectado()`.
  - Delega `registrarRepeticion`, `escalar`, `atender` y `nivel` directamente en `this.estado`.
  - Provee a los estados los métodos auxiliares `cambiarEstado(nuevo)` y `agregarAcciones(acciones)`.
  - Expone los *getters* de solo lectura `nombreEstado` e `historialAcciones`.
- **Patrón Builder ([`src/dominio/incidente/IncidenteBuilder.ts`](src/dominio/incidente/IncidenteBuilder.ts)):**
  - Provee métodos encadenables: `paraConductor(id)`, `deTipo(tipo)`, `ocurridoEn(fecha)`, `enUbicacion(ubicacion)` y `silenciado(valor)`.
  - Por defecto `esSilenciado = false`. La ubicación es opcional.
  - `construir()`: Valida que `conductorId`, `tipo` y `fecha` no sean nulos ni indefinidos. Si falta alguno, lanza un `Error` explicativo; de lo contrario, retorna la nueva instancia de `Incidente`.
- **Pruebas asociadas:** Convertir los `it.todo` de [`tests/incidente.test.ts`](tests/incidente.test.ts) en pruebas unitarias que validen:
  1. Creación en estado `Detectado` con nivel `PRECAUCION`.
  2. Lanzamiento de error si faltan campos requeridos en el builder.
  3. Transición a `Escalado` y nivel `CRITICO` tras `escalar()`.
  4. Inmunidad de `EstadoAtendido` frente a nuevas acciones.

---

### Parte 3 – Adaptadores de Salida (`Adapter`, `Decorator`)
**Estado:** ✅ *Completada*

*Objetivo:* Implementar los puertos de salida conectando el núcleo con la infraestructura simulada y proveedores externos.

- **Patrón Adapter ([`src/adaptadores/salida/notificadores/`](src/adaptadores/salida/notificadores/)):**
  - Todos implementan el contrato unificado [`Notificador`](src/aplicacion/puertos/salida/Notificador.ts) (`enviar(accion)`):
  - `NotificadorPushFcmSimulado.ts`:
    - Inyecta en el constructor a `ClienteFcmFalso`.
    - Traduce `accion` y ejecuta `cliente.send(accion.destinatario, { title: 'Fatigue Alert', body: accion.mensaje })`.
  - `NotificadorSmsSimulado.ts`:
    - Inyecta en el constructor a `ProveedorSmsFalso`.
    - Traduce `accion` y ejecuta `await proveedor.sendMessage(accion.destinatario, accion.mensaje)`.
    - Si el proveedor retorna `{ ok: false }`, debe lanzar un `Error` para activar los reintentos.
  - `NotificadorDashboardSimulado.ts`:
    - Almacena las acciones recibidas en la lista pública `publicadas` y simula la emisión por consola.
- **Patrón Decorator ([`NotificadorConReintento.ts`](src/adaptadores/salida/notificadores/NotificadorConReintento.ts)):**
  - Implementa `Notificador` y recibe otro `Notificador` en su constructor junto con un límite de intentos (por defecto 3).
  - En `enviar(accion)` ejecuta un ciclo: intenta despachar llamando a `this.envuelto.enviar(accion)`. Si ocurre un fallo, reintenta hasta el límite. Si todos los intentos fallan, relanza la última excepción capturada.
- **Repositorio y Perfiles Simulados:**
  - `src/adaptadores/salida/RepositorioIncidentesEnMemoria.ts`: Implementa `RepositorioIncidentes`. `guardar(incidente)` persiste en un arreglo en memoria. `contarRecientes(conductorId, desde)` filtra por conductor y fecha $\ge$ `desde` (garantiza devolver un número entero $\ge 0$, nunca `null`, cumpliendo LSP).
  - `src/adaptadores/salida/ConsultorPerfilSimulado.ts`: Implementa `ConsultorPerfil`. Busca en el mapa interno; si el `conductorId` no existe, lanza un `Error` descriptivo.
- **Pruebas asociadas:** Convertir los `it.todo` de [`tests/adaptadores.test.ts`](tests/adaptadores.test.ts) en pruebas unitarias que verifiquen:
  1. Traducción adecuada de `NotificadorSmsSimulado` a `sendMessage`.
  2. Éxito de `NotificadorConReintento` ante fallas transitorias iniciales.
  3. Relanzamiento del error en `NotificadorConReintento` si se agotan todos los reintentos.
  4. Conteo temporal y por conductor exacto en `RepositorioIncidentesEnMemoria`.

---

### Parte 4 – Adaptador de Entrada y Cierre (`Controlador REST`, `OCP`)
**Estado:** ✅ *Completada*

*Objetivo:* Exponer el puerto de entrada del servicio, validar cargas útiles del exterior y verificar la extensibilidad del diseño según el principio Abierto/Cerrado (Fase 7 del informe).

- **Controlador Primario ([`src/adaptadores/entrada/ControladorAlertasRest.ts`](src/adaptadores/entrada/ControladorAlertasRest.ts)):**
  - Recibe en su constructor una implementación del puerto de entrada `ProcesarAlerta`.
  - Método `recibirAlerta(json: unknown)`:
    - Valida que `json` sea un objeto no nulo.
    - Valida la presencia de campos obligatorios: `conductorId`, `tipo`, `ocurridaEn` y `silenciada`. Si falta alguno, lanza `Error`.
    - Valida que `tipo` corresponda a un valor válido del enum `TipoEvento` (`MICROSUENO` o `CABECEO`).
    - Convierte la marca temporal `ocurridaEn` (string ISO) a un objeto `Date` válido.
    - Mapea el objeto `ubicacion` (opcional).
    - Entrega la estructura `AlertaFatiga` al caso de uso: `await this.casoDeUso.procesar(alerta)`.
- **Pruebas del Controlador ([`tests/controlador.test.ts`](tests/controlador.test.ts)):**
  - Verificar rechazo ante JSON sin `conductorId` o con campos inválidos.
  - Verificar transformación correcta de tipos y llamado a `ProcesarAlerta`.
- **Prueba de Extensión Abierto/Cerrado ([`tests/abierto-cerrado.test.ts`](tests/abierto-cerrado.test.ts)):**
  - Simula el escenario de evolución 7.1 del informe: incorporación del perfil de **Transporte Público** sin modificar el código fuente de `src/`.
  - En el test se define `PoliticaTransportePublico implements PoliticaEscalamiento`.
  - Se define una subclase de `FabricaPoliticas` que sobreescribe `crearPara(contexto)` para retornar la nueva política ante el nuevo perfil y llamar a `super.crearPara(contexto)` en los casos base.
  - Se demuestra que `ServicioEscalamiento` opera con la nueva política sin requerir cambios en el núcleo.

