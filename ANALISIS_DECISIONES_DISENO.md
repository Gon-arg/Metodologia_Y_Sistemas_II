# Análisis de decisiones de diseño

## 1. Introducción

La aplicación está orientada a la gestión de las finanzas personales de un usuario. Su alcance actual es acotado y responde a las necesidades definidas para este proyecto. No se plantea como una plataforma SaaS destinada a múltiples clientes con requisitos diferentes; si en el futuro surgieran necesidades sustancialmente distintas, se evaluaría desarrollar una nueva aplicación o una solución específica, en lugar de incorporar complejidad anticipadamente.

## 2. Análisis de patrones de diseño

### 2.1. Singleton

**Estado**: presente de manera similar, sin una implementación clásica del patrón.

En el backend, la conexión a la base de datos utiliza un `pg.Pool` que se crea en un módulo de configuración y se exporta para que otros módulos puedan reutilizarlo. Esta implementación permite compartir un conjunto de conexiones a PostgreSQL en lugar de crear un pool nuevo cada vez que un controlador o servicio necesita consultar la base de datos.

La solución presenta un comportamiento similar al objetivo del patrón Singleton, porque centraliza la creación y reutilización de una instancia compartida. Sin embargo, no se implementa una clase Singleton clásica que controle explícitamente la creación de una única instancia. La reutilización se apoya en el sistema de módulos de Node.js y en la exportación de la instancia configurada.

**Justificación de la decisión**: esta solución es suficiente para el tamaño y las necesidades actuales del backend. No se considera necesario introducir una clase adicional únicamente para reproducir la estructura formal del patrón.

### 2.2. Factory Method

**Estado**: no implementado.

No se identificó una implementación que utilice Factory Method para delegar en subclases o implementaciones especializadas la creación de objetos. Como alternativa futura, podría evaluarse una fábrica para generar distintos tipos de reportes financieros si el sistema incorporara formatos o comportamientos de generación diferentes. Por ejemplo, una futura funcionalidad podría requerir reportes mensuales, anuales o exportaciones en distintos formatos. En ese escenario, una fábrica podría centralizar la selección y creación del generador correspondiente.

**Justificación de la decisión**: actualmente no existe una variedad de objetos de una misma familia cuya creación justifique introducir esta abstracción. Incorporarla ahora agregaría complejidad sin resolver una necesidad concreta.

### 2.3. Builder

**Estado**: no implementado.

No se identificó una implementación del patrón Builder destinada a construir objetos complejos mediante pasos independientes. Como posible aplicación futura, podría evaluarse para construir reportes financieros que incluyeran diferentes secciones opcionales, como ingresos, gastos, categorías, metas de ahorro y estadísticas.

**Justificación de la decisión**: los objetos que necesita construir la aplicación actualmente no presentan una complejidad suficiente como para justificar un constructor especializado. La creación directa de los objetos resulta adecuada para el alcance actual.

### 2.4. Adapter

**Estado**: no implementado como patrón explícito.

El backend cuenta con una configuración para el envío de correos electrónicos mediante Nodemailer. Esta configuración centraliza la creación del transportador y la función encargada del envío, pero no constituye por sí misma un Adapter.

El patrón Adapter podría ser útil si la aplicación necesitara trabajar con distintos proveedores de correo electrónico mediante una interfaz común. En ese escenario, un adaptador permitiría traducir las operaciones de la aplicación a las particularidades de cada proveedor. Por ejemplo, se podría definir una operación común para enviar un correo y contar con implementaciones específicas para Nodemailer u otro servicio externo.

**Justificación de la decisión**: actualmente se utiliza una única solución para el envío de correos. No existe una necesidad concreta de compatibilidad entre interfaces diferentes que justifique introducir adaptadores.

### 2.5. Facade

**Estado**: presente en el frontend.

El módulo `client.js` centraliza la comunicación HTTP entre el frontend y el backend mediante una función genérica:

```
request(path, options = {})
```

Además, exporta operaciones auxiliares como `get`, `post`, `put` y `del`, que permiten realizar solicitudes HTTP sin repetir la configuración básica en cada llamada.

Entre las responsabilidades del módulo se encuentran:

- Incorporar la URL base de la API mediante `API_BASE_URL`.
- Configurar los encabezados de las solicitudes, incluyendo `Content-Type: application/json`.
- Obtener el token de autenticación mediante `getToken()` e incluirlo en el encabezado `Authorization` cuando existe.
- Serializar el cuerpo de las solicitudes en formato JSON.
- Procesar las respuestas del servidor.
- Interpretar los errores devueltos por el backend y generar excepciones con mensajes comprensibles.

Los módulos ubicados en `js/api/*.js` utilizan este cliente común, por lo que no necesitan repetir estas tareas en cada solicitud.

Esta solución se corresponde con el propósito del patrón Facade: ofrecer una interfaz sencilla que oculta y centraliza detalles de un mecanismo más complejo. Se trata de una fachada funcional implementada mediante módulos y funciones, no de una clase específica denominada Facade.

**Justificación de la decisión**: centralizar la comunicación HTTP reduce la duplicación y permite modificar comportamientos comunes desde un único punto. Por ejemplo, un cambio en el tratamiento de errores o en la incorporación del token puede realizarse en `client.js` sin tener que replicarlo en cada módulo consumidor.

### 2.6. Decorator

**Estado**: no identificado como patrón explícito.

El backend utiliza middlewares de Express para realizar tareas como autenticación, validación de datos y manejo de errores. Aunque los middlewares pueden encadenar comportamientos y ampliar el procesamiento de una solicitud, no se los considera automáticamente una implementación del patrón Decorator. Su presencia responde principalmente al mecanismo de procesamiento de solicitudes de Express.

Como alternativa futura, podría evaluarse un decorador para agregar responsabilidades opcionales a determinadas operaciones, por ejemplo, registrar métricas o información de auditoría alrededor de una operación de servicio sin modificar su lógica principal.

**Justificación de la decisión**: las necesidades actuales pueden resolverse con los mecanismos de middleware y la separación de responsabilidades que ya ofrece la arquitectura. No se identificó un problema concreto que requiera un Decorator explícito.

### 2.7. Observer

**Estado**: no implementado.

No se identificó un mecanismo de suscripción y notificación a múltiples observadores cuando cambia el estado de un objeto o se produce un evento relevante. En una futura evolución, podría considerarse para notificar al usuario cuando alcance una meta de ahorro, registre determinados movimientos o se produzca otro evento financiero relevante. En ese escenario, el componente que genera el evento podría mantenerse desacoplado de los componentes encargados de enviar las notificaciones.

**Justificación de la decisión**: el sistema actual no requiere una infraestructura de eventos y suscriptores. Incorporarla sin una necesidad concreta aumentaría la complejidad del flujo de ejecución.

### 2.8. Strategy

**Estado**: no implementado como patrón explícito.

El proyecto cuenta con un mecanismo de validación configurable que permite establecer reglas para distintos campos. Sin embargo, esto no significa que implemente el patrón Strategy. La función central de validación procesa los tipos de reglas mediante condiciones internas. Aunque los criterios se configuran por separado, los algoritmos de validación no están encapsulados en estrategias independientes que puedan intercambiarse mediante una interfaz común.

Strategy podría evaluarse si en el futuro existieran diferentes algoritmos intercambiables, por ejemplo, distintas estrategias de análisis financiero o un conjunto de validadores independientes seleccionados según el tipo de dato.

**Justificación de la decisión**: el mecanismo actual es suficiente para las validaciones requeridas. No se considera necesario dividirlo en múltiples estrategias mientras no exista una variedad de algoritmos que justifique esa separación.

### 2.9. Command

**Estado**: no implementado.

No se identificó una implementación en la que las operaciones se representen como objetos independientes que encapsulen una acción y sus parámetros. En una futura versión, podría evaluarse este patrón si se incorporaran operaciones que necesitaran deshacerse o repetirse, como determinadas acciones sobre movimientos financieros o modificaciones de metas.

**Justificación de la decisión**: actualmente no se requiere administrar un historial de comandos ni implementar operaciones de deshacer y rehacer. Por lo tanto, no existe una necesidad que justifique esta abstracción.

### 2.10. Resumen de patrones analizados

| Patrón | Estado actual | Observación |
|---|---|---|
| Singleton | Similar, no clásico | Se reutiliza una instancia compartida de `pg.Pool`. |
| Factory Method | No implementado | Podría evaluarse para crear distintos tipos de reportes. |
| Builder | No implementado | Sería útil si la construcción de objetos complejos lo requiriera. |
| Adapter | No implementado explícitamente | Podría desacoplar la aplicación de distintos proveedores externos. |
| Facade | Presente | `client.js` simplifica y centraliza las solicitudes HTTP del frontend. |
| Decorator | No identificado | Los middlewares de Express no se consideran automáticamente este patrón. |
| Observer | No implementado | Podría utilizarse para notificaciones basadas en eventos. |
| Strategy | No implementado explícitamente | Las reglas configurables no constituyen, por sí solas, estrategias intercambiables. |
| Command | No implementado | Podría evaluarse si se necesitan operaciones reversibles o repetibles. |

## 3. Análisis de Clean Code y code smells

### 3.1. Duplicación de lógica de validación

Uno de los aspectos identificados en el backend fue la repetición de condiciones `if` para validar los datos recibidos por distintos middlewares. Cuando cada middleware contiene su propia lógica para comprobar campos obligatorios, tipos de datos, longitudes o formatos, pueden aparecer varios problemas:

- Se repite código que cumple una función similar.
- Una modificación debe realizarse en múltiples lugares.
- Pueden surgir diferencias entre validaciones equivalentes.
- El mantenimiento se vuelve más difícil a medida que aumenta la cantidad de campos y operaciones.

Este caso constituye un indicio de código duplicado y de una oportunidad de refactorización. La solución adoptada fue centralizar la lógica común en `backend/utils/validator.js`, manteniendo las reglas particulares de cada operación en los middlewares correspondientes.

### 3.2. Acoplamiento entre validación y procesamiento de solicitudes

La validación de datos es una responsabilidad diferente de la generación de respuestas HTTP. Cuando un middleware mezcla demasiadas condiciones de validación con el manejo de respuestas y otros detalles de la solicitud, se vuelve más difícil comprender qué parte del código corresponde a cada responsabilidad.

La implementación actual mantiene una separación entre la función reutilizable de validación y los middlewares que la invocan. Estos últimos deciden qué reglas aplicar y cómo responder cuando se encuentran errores. Esto permite que el mecanismo de validación no necesite conocer los detalles de las respuestas HTTP para cumplir su función.

### 3.3. Complejidad innecesaria

Un riesgo frecuente consiste en introducir abstracciones antes de que exista una necesidad real. En este proyecto se prioriza la reutilización y la separación de responsabilidades que resuelven problemas observables. Las abstracciones adicionales quedan sujetas a futuras necesidades concretas.

### 3.4. Legibilidad y nombres

La elección de nombres descriptivos facilita la comprensión del código. Funciones como `validar`, `validateCrearUsuario` y `validateActualizarUsuario` permiten reconocer la intención general de cada operación. También es importante mantener una convención consistente en nombres de archivos, funciones y variables, así como separar las reglas de validación de la lógica que las ejecuta.

La legibilidad no depende solamente de nombres individuales, sino también de que cada módulo tenga un propósito reconocible y una estructura fácil de seguir.

### 3.5. Acoplamiento entre componentes

En una aplicación que utiliza un frontend y un backend, los distintos módulos necesitan colaborar para completar las operaciones del usuario. Sin embargo, si cada componente conoce demasiados detalles internos de los demás, un cambio puede afectar múltiples partes del sistema.

En el frontend, `client.js` centraliza la comunicación HTTP, evitando que cada consumidor tenga que implementar por separado la preparación de solicitudes y el tratamiento de respuestas. En el backend, la separación entre rutas, controladores, servicios, middlewares y configuración permite distribuir el procesamiento entre componentes con propósitos diferentes.

Estas decisiones ayudan a controlar el acoplamiento, aunque no implican que todos los componentes sean completamente independientes. La aplicación sigue dependiendo de contratos compartidos, como los endpoints, los datos enviados y las respuestas esperadas.

## 4. Refactoring realizado

### 4.1. Situación inicial

En los middlewares de validación del backend existía lógica repetida mediante múltiples condiciones `if` para comprobar los datos recibidos. El objetivo de la refactorización fue reducir esa duplicación y centralizar la ejecución de las validaciones, sin modificar innecesariamente el comportamiento esperado de los endpoints.

### 4.2. Solución implementada

Se creó el módulo `backend/utils/validator.js`, que exporta una función general de validación:

```
validar(datos, reglas, opciones = {})
```

La función recibe los datos que se deben revisar, las reglas correspondientes a cada campo y opciones adicionales. Su responsabilidad es evaluar las reglas y devolver un arreglo de errores.

El mecanismo permite configurar diferentes criterios de validación, entre ellos:

- Campos obligatorios.
- Valores opcionales y tratamiento de `null`.
- Permisión o rechazo de cadenas vacías.
- Eliminación de espacios al comienzo y al final.
- Conversión de cadenas a minúsculas.
- Validación de tipos como `string`, `entero`, `numero` y `numeroNoNegativo`.
- Longitudes máximas y mínimas.
- Cantidad de decimales.
- Valores permitidos.
- Expresiones regulares.
- Opciones adicionales, como exigir que se haya enviado al menos uno de determinados campos, cuando se activa la opción correspondiente.

Los middlewares mantienen la definición de las reglas particulares de cada operación y delegan su evaluación en la función compartida. Por ejemplo, se definen reglas reutilizables para el nombre, el correo electrónico y la contraseña. A partir de esas reglas se construye la configuración para crear un usuario y se deriva otra configuración para actualizarlo, estableciendo como no obligatorios los campos de esta última.

Los middlewares `validateCrearUsuario` y `validateActualizarUsuario` invocan al validador. Si se encuentran errores, responden con estado HTTP 400 y la información correspondiente; si no hay errores, continúan el procesamiento mediante `next()`.

### 4.3. Beneficios de la refactorización

La modificación aporta las siguientes mejoras:

- **Menos duplicación**: la lógica general de validación se encuentra en un único módulo.
- **Mayor reutilización**: diferentes middlewares pueden utilizar el mismo mecanismo con reglas distintas.
- **Separación de responsabilidades**: el validador evalúa los datos, mientras que los middlewares definen las reglas y gestionan el flujo de la solicitud.
- **Mantenimiento más sencillo**: los cambios en un criterio de validación compartido pueden realizarse en un único lugar.
- **Mayor consistencia**: los campos pueden someterse al mismo mecanismo de validación, reduciendo diferencias accidentales entre implementaciones.

La refactorización no elimina todas las condiciones `if` del sistema. Las condiciones siguen siendo necesarias para ejecutar las distintas comprobaciones; la mejora consiste en centralizar esa lógica y evitar repetirla en cada middleware.

### 4.4. Relación con los patrones de diseño

El validador compartido es una refactorización que aplica principios de reutilización y separación de responsabilidades. No constituye automáticamente una implementación de Strategy. Para aplicar Strategy de forma explícita, podría ser necesario encapsular los algoritmos de validación en implementaciones independientes que compartieran una interfaz común y pudieran seleccionarse o sustituirse sin modificar el mecanismo central. Esta posibilidad se considera una alternativa futura, no una característica implementada actualmente.

### 4.5. Aspectos a considerar

La centralización facilita el mantenimiento, pero también concentra diferentes tipos de validación en una misma función. Si el módulo crece significativamente, podría resultar conveniente separar algunas comprobaciones en funciones auxiliares o módulos especializados.

## 5. Análisis de principios SOLID

Los principios SOLID permiten evaluar si el diseño facilita el mantenimiento, la extensión y la separación de responsabilidades. Su análisis debe considerar el funcionamiento general del proyecto y no solamente un módulo aislado.

### 5.1. Single Responsibility Principle (SRP)

Principio de responsabilidad única. Este principio establece que un módulo debería tener una responsabilidad principal y una razón clara para cambiar.

En el backend se observa una separación entre rutas, controladores, servicios, middlewares y módulos de configuración. Esta organización permite distinguir diferentes tareas:

- Las rutas definen los endpoints y los middlewares asociados.
- Los controladores reciben las solicitudes y coordinan las respuestas HTTP.
- Los servicios concentran operaciones y lógica relacionadas con las funcionalidades de la aplicación.
- Los middlewares se encargan de tareas transversales, como autenticación, validación y manejo de errores.
- Los módulos de configuración centralizan la preparación de recursos, como la conexión a la base de datos.

Esta distribución evita que toda la lógica de una funcionalidad tenga que concentrarse en un único archivo. También permite localizar con mayor facilidad dónde realizar un cambio según el tipo de responsabilidad involucrada.

En el módulo de conexión a PostgreSQL, la creación y configuración del `Pool` se realiza en un único lugar. Su propósito es proporcionar la instancia compartida para las consultas a la base de datos, sin mezclar esa configuración con las operaciones particulares de cada funcionalidad.

En el frontend, el módulo `client.js` centraliza las operaciones comunes de comunicación HTTP. La función `request()` se ocupa de preparar la solicitud, incluir el token cuando corresponde, procesar la respuesta y gestionar los errores. Las funciones `get`, `post`, `put` y `del` proporcionan accesos reutilizables a ese mecanismo. De esta forma, los módulos que consumen la API pueden concentrarse en las operaciones propias de sus funcionalidades sin repetir los detalles de cada solicitud.

La refactorización del validador también se relaciona con SRP porque separa la evaluación de las reglas de la gestión del flujo HTTP: `validar` evalúa los datos, mientras que los middlewares definen las reglas de cada operación y deciden cómo responder ante errores. No obstante, la función central de validación reúne varios tipos de comprobaciones. Esto resulta razonable para el alcance actual, aunque podría revisarse si su tamaño o complejidad dificultaran el mantenimiento.

**Evaluación**: se observa una aplicación práctica de SRP tanto en la organización del backend como en la centralización de responsabilidades comunes del frontend. La separación no es absoluta y debe mantenerse a medida que evolucionen las funcionalidades.

### 5.2. Open/Closed Principle (OCP)

Principio abierto/cerrado. Este principio propone que los componentes estén abiertos a la extensión y cerrados a la modificación, en la medida en que resulte razonable.

En el backend, el validador permite configurar reglas por campo, como longitud máxima, valores permitidos, expresiones regulares y cantidad de decimales. Esto permite modificar las restricciones de un campo o agregar reglas a una configuración sin duplicar toda la lógica de validación en cada middleware. Sin embargo, cuando se necesita incorporar un tipo de validación completamente nuevo, actualmente es posible que haya que modificar la función central para agregar la condición correspondiente. Por esa razón, la configuración de reglas favorece la extensión de las restricciones existentes, pero no elimina la necesidad de modificar el mecanismo para incorporar nuevos algoritmos.

En el frontend, `client.js` ofrece operaciones HTTP reutilizables para que los módulos consumidores utilicen una interfaz común. La función `request()` acepta opciones adicionales y las operaciones auxiliares reutilizan ese mecanismo. Esto facilita realizar distintas solicitudes sin replicar la implementación básica. No obstante, la incorporación de un nuevo comportamiento transversal, como una política de reintentos o una estrategia de autenticación diferente, podría requerir modificar el cliente. Por lo tanto, centralizar las operaciones no demuestra por sí solo un cumplimiento completo de OCP.

En términos generales, la separación entre rutas, controladores y servicios también permite incorporar funcionalidades nuevas siguiendo la organización existente. Sin embargo, no se afirma que todos los componentes puedan extenderse sin modificaciones: eso depende de cómo estén implementados y de las dependencias entre ellos.

Una alternativa futura para el validador sería separar los algoritmos en validadores independientes y seleccionarlos mediante un contrato común. Esta solución podría reducir la necesidad de modificar el núcleo del mecanismo cuando se incorporen nuevos tipos de validación.

**Evaluación**: existe una aplicación parcial de OCP mediante configuraciones reutilizables y puntos comunes de acceso. El principio no se cumple de forma completa en todos los módulos, y no se considera necesario introducir abstracciones adicionales mientras el diseño actual permita atender las necesidades del proyecto.

### 5.3. Liskov Substitution Principle (LSP)

Principio de sustitución de Liskov. Este principio establece que una implementación derivada debe poder sustituir a su tipo base sin alterar las propiedades esperadas del sistema.

En el diseño analizado no se identificó una jerarquía de clases o una familia de implementaciones intercambiables cuya sustitución permita evaluar de manera significativa este principio. El proyecto utiliza módulos y funciones para distribuir responsabilidades, pero la modularidad no implica automáticamente una aplicación de LSP.

Para analizarlo directamente sería necesario contar con tipos base, contratos o implementaciones alternativas que debieran comportarse de manera compatible. Por ejemplo, si en el futuro se incorporaran distintos proveedores de correo electrónico o diferentes implementaciones de un servicio financiero bajo un mismo contrato, sería importante comprobar que todas respetaran las condiciones y los resultados esperados de ese contrato.

**Evaluación**: no se identificó una aplicación directa de LSP que resulte central en el diseño actual. Esto no implica un incumplimiento; significa que no se encontró una jerarquía relevante para evaluar el principio con suficiente fundamento.

### 5.4. Interface Segregation Principle (ISP)

Principio de segregación de interfaces. Este principio recomienda que los componentes no dependan de interfaces que incluyan operaciones que no necesitan.

En el proyecto se utilizan módulos y funciones con responsabilidades específicas. Por ejemplo, el frontend puede consumir las operaciones HTTP expuestas por `client.js`, mientras que el backend distribuye las responsabilidades entre rutas, controladores, servicios y middlewares.

El cliente HTTP expone operaciones concretas como `get`, `post`, `put` y `del`. Esto permite que los módulos consumidores utilicen las operaciones que necesitan sin tener que implementar directamente toda la lógica de comunicación.

Sin embargo, la existencia de módulos separados no demuestra por sí sola una aplicación completa de ISP. El principio se refiere específicamente a evitar contratos demasiado amplios que obliguen a los consumidores a depender de operaciones irrelevantes para ellos. No se identificó una jerarquía de interfaces formales cuya segregación constituya una decisión central del diseño actual. Por eso, no sería correcto afirmar que el proyecto implementa ISP explícitamente solo por utilizar archivos y funciones separados.

**Evaluación**: la organización modular es compatible con el objetivo de ISP, ya que favorece el uso de responsabilidades acotadas. Sin embargo, no se identificó evidencia suficiente para afirmar una aplicación explícita del principio mediante interfaces formales.

### 5.5. Dependency Inversion Principle (DIP)

Principio de inversión de dependencias. Este principio propone que los componentes de alto nivel no dependan directamente de detalles de bajo nivel, sino de abstracciones adecuadas. A su vez, los detalles de implementación deberían depender de esas abstracciones.

En el backend, el módulo de conexión crea y configura un `pg.Pool` y exporta la instancia mediante `module.exports`. Esto evita que cada módulo tenga que configurar individualmente las conexiones a PostgreSQL y reduce la dispersión de los detalles técnicos. Sin embargo, centralizar la conexión no equivale a aplicar DIP de forma completa. Si los servicios dependen directamente de un módulo concreto de acceso a datos, siguen existiendo dependencias respecto de esa implementación, aunque su configuración esté centralizada.

En el frontend, `client.js` encapsula la comunicación HTTP y oculta a los consumidores detalles como la URL base, los encabezados, el token y el tratamiento de errores. Los módulos de `js/api/*.js` pueden utilizar las operaciones exportadas sin repetir esa lógica. No obstante, el cliente depende directamente de `fetch`, de `API_BASE_URL` y de `getToken()`. Por eso, aunque encapsula detalles técnicos y simplifica su uso, no demuestra que los módulos de alto nivel dependan de contratos independientes de las implementaciones concretas.

En ambos casos se observa una intención de encapsular detalles técnicos y ofrecer puntos de acceso compartidos. Para afirmar una inversión explícita de dependencias sería necesario verificar que los componentes de alto nivel dependan de abstracciones o contratos independientes y que las implementaciones concretas puedan sustituirse sin modificar la lógica principal.

**Evaluación**: existe una centralización de detalles técnicos que facilita el mantenimiento y reduce la duplicación. No obstante, no se afirma que toda la arquitectura implemente DIP de forma completa, ya que la centralización de una dependencia no es equivalente a invertirla.

### 5.6. Resumen del análisis SOLID

| Principio | Evaluación en el proyecto |
|---|---|
| **SRP** | Se observa separación de responsabilidades entre rutas, controladores, servicios, middlewares y configuración en el backend, así como un cliente HTTP común en el frontend. |
| **OCP** | Las reglas configurables del validador y las operaciones comunes del cliente HTTP facilitan la reutilización, aunque ciertos cambios siguen requiriendo modificar los módulos centrales. |
| **LSP** | No se identificó una jerarquía relevante de tipos o implementaciones intercambiables para evaluar su aplicación directa. |
| **ISP** | La organización modular y las operaciones específicas del cliente HTTP favorecen responsabilidades acotadas, pero no se identificó una aplicación explícita mediante interfaces formales. |
| **DIP** | Se centralizan detalles técnicos como la conexión a la base de datos y las solicitudes HTTP, pero esto no demuestra una inversión completa basada en abstracciones. |

El análisis de SOLID no busca forzar la aplicación de todos los principios. Permite identificar qué decisiones del diseño contribuyen a la mantenibilidad, cuáles representan una aplicación parcial y dónde no existe evidencia suficiente para afirmar su cumplimiento.

## 6. Decisión de diseño fundamentada

### 6.1. Problema identificado

La repetición de lógica de validación en distintos middlewares del backend generaba duplicación y dificultaba mantener criterios consistentes entre operaciones. La necesidad concreta consistía en reducir esa duplicación sin incorporar una estructura excesivamente compleja para una aplicación de alcance acotado.

### 6.2. Alternativas consideradas

Se consideraron las siguientes posibilidades.

**Alternativa A: mantener las validaciones duplicadas.**
Esta alternativa evita cambios en la estructura actual, pero mantiene la repetición de condiciones y hace que las modificaciones deban replicarse en varios lugares.

**Alternativa B: centralizar las validaciones mediante una función configurable.**
Esta alternativa permite reutilizar la lógica general, definir reglas por campo y conservar en cada middleware las particularidades de la operación.

**Alternativa C: implementar Strategy con validadores independientes.**
Esta alternativa consistiría en encapsular distintos algoritmos de validación en componentes independientes que pudieran seleccionarse mediante un contrato común. Facilitaría incorporar nuevos tipos de validación, pero también aumentaría la cantidad de abstracciones y componentes que deben mantenerse.

### 6.3. Criterios de evaluación

Las alternativas se evaluaron considerando:

- La reducción de código duplicado.
- La facilidad de mantenimiento.
- La claridad de las responsabilidades.
- La posibilidad de extender las validaciones.
- La complejidad adicional introducida.
- La correspondencia entre la solución y las necesidades reales de la aplicación.

### 6.4. Decisión adoptada

Se decidió centralizar la lógica de validación en `backend/utils/validator.js` y mantener las reglas específicas en los middlewares correspondientes. Esta decisión permite reutilizar la lógica común y reducir la duplicación, sin introducir una arquitectura de estrategias que no resulta necesaria para el alcance actual.

No se incorporó Strategy porque las validaciones requeridas pueden resolverse mediante la función configurable existente y no se identificó una necesidad concreta de intercambiar algoritmos de validación independientes. La decisión prioriza una solución comprensible, suficiente y mantenible frente a una abstracción adicional cuyo beneficio actual sería limitado.

### 6.5. Consecuencias de la decisión

**Beneficios:**

- Se reduce la duplicación de lógica.
- Se facilita el mantenimiento de las validaciones.
- Las reglas pueden reutilizarse entre distintas operaciones.
- Se conserva una estructura sencilla de comprender.
- Se evita agregar componentes sin una necesidad concreta.

**Limitaciones:**

- La función central todavía necesita modificaciones cuando se incorpora un nuevo tipo de validación.
- La cantidad de comprobaciones dentro del validador podría crecer.
- Si aparecieran algoritmos muy diferentes o intercambiables, la solución actual podría resultar menos flexible que una arquitectura basada en estrategias.

### 6.6. Condiciones para revisar la decisión

La decisión no implica descartar Strategy de forma permanente. Podría revisarse si el proyecto incorporara muchos tipos de validación con algoritmos diferentes, si las condiciones internas del validador crecieran considerablemente o si se necesitara agregar nuevas validaciones sin modificar el mecanismo central. En ese caso, se podría evaluar una refactorización incremental hacia validadores independientes, comparando los beneficios obtenidos con el costo de implementación y mantenimiento.

## 7. Conclusiones

El análisis permitió identificar soluciones de diseño que ya aportan valor al proyecto, como la reutilización de un pool de conexiones a la base de datos y la fachada del cliente HTTP del frontend. El módulo de conexión a PostgreSQL centraliza la configuración y exporta una instancia compartida de `pg.Pool`, mientras que `client.js` ofrece una interfaz común para realizar solicitudes HTTP, incorporar el token de autenticación y gestionar las respuestas y los errores.

También se distinguió entre patrones implementados, comportamientos similares a ciertos patrones y alternativas que solo tendrían sentido ante nuevas necesidades. Esta distinción evita atribuir al sistema características que el código actual no implementa.

En relación con Clean Code, se identificó la duplicación de validaciones en el backend como una oportunidad concreta de mejora. La refactorización realizada centralizó la lógica común en un validador configurable y mantuvo las reglas específicas en los middlewares, mejorando la reutilización y la organización del código.

El análisis SOLID se amplió para considerar la arquitectura general del proyecto. Se identificó una separación de responsabilidades entre los componentes del backend y la centralización de la comunicación HTTP en el frontend. También se reconoció que algunas decisiones favorecen parcialmente la extensión del sistema, aunque no implican un cumplimiento completo de todos los principios. En particular, se distinguió entre centralizar una dependencia e invertirla, entre utilizar módulos separados y aplicar explícitamente ISP, y entre configurar reglas de validación y disponer de estrategias intercambiables. Estas diferencias permiten realizar una evaluación más precisa del diseño.

Finalmente, se decidió no introducir el patrón Strategy en el mecanismo de validación. La decisión se fundamenta en que la solución implementada responde a las necesidades actuales y evita agregar complejidad sin un beneficio proporcional.

En conclusión, el diseño se evalúa en función de los problemas que resuelve y de su adecuación al alcance del proyecto. Las futuras mejoras deberán justificarse por necesidades concretas, priorizando la legibilidad, la mantenibilidad y la simplicidad antes que la incorporación de patrones de diseño o principios arquitectónicos de manera indiscriminada.