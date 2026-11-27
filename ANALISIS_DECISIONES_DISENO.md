# Análisis de decisiones de diseño

## 1. Introducción

La aplicación está orientada a la gestión de las finanzas personales de un usuario. Su alcance actual es acotado y responde a las necesidades definidas para este proyecto. No se plantea como una plataforma SaaS destinada a múltiples clientes con requisitos diferentes; si en el futuro surgieran necesidades sustancialmente distintas, se evaluaría desarrollar una nueva aplicación o una solución específica, en lugar de incorporar complejidad anticipadamente.

## 2. Refactoring realizado

### 2.1. Situación inicial

En los middlewares de validación del backend existía lógica repetida mediante múltiples condiciones `if` para comprobar los datos recibidos. El objetivo de la refactorización fue reducir esa duplicación y centralizar la ejecución de las validaciones, sin modificar innecesariamente el comportamiento esperado de los endpoints.

### 2.2. Solución implementada

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

### 2.3. Beneficios de la refactorización

La modificación aporta las siguientes mejoras:

- **Menos duplicación**: la lógica general de validación se encuentra en un único módulo.
- **Mayor reutilización**: diferentes middlewares pueden utilizar el mismo mecanismo con reglas distintas.
- **Separación de responsabilidades**: el validador evalúa los datos, mientras que los middlewares definen las reglas y gestionan el flujo de la solicitud.
- **Mantenimiento más sencillo**: los cambios en un criterio de validación compartido pueden realizarse en un único lugar.
- **Mayor consistencia**: los campos pueden someterse al mismo mecanismo de validación, reduciendo diferencias accidentales entre implementaciones.

La refactorización no elimina todas las condiciones `if` del sistema. Las condiciones siguen siendo necesarias para ejecutar las distintas comprobaciones; la mejora consiste en centralizar esa lógica y evitar repetirla en cada middleware.

### 2.4. Relación con los patrones de diseño

El validador compartido es una refactorización que aplica principios de reutilización y separación de responsabilidades. No constituye automáticamente una implementación de Strategy. Para aplicar Strategy de forma explícita, podría ser necesario encapsular los algoritmos de validación en implementaciones independientes que compartieran una interfaz común y pudieran seleccionarse o sustituirse sin modificar el mecanismo central. Esta posibilidad se considera una alternativa futura, no una característica implementada actualmente.

### 2.5. Aspectos a considerar

La centralización facilita el mantenimiento, pero también concentra diferentes tipos de validación en una misma función. Si el módulo crece significativamente, podría resultar conveniente separar algunas comprobaciones en funciones auxiliares o módulos especializados.

## 3. Análisis de principios SOLID

Los principios SOLID permiten evaluar si el diseño facilita el mantenimiento, la extensión y la separación de responsabilidades. Su análisis debe considerar el funcionamiento general del proyecto y no solamente un módulo aislado.

### 3.1. Single Responsibility Principle (SRP)

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

### 3.2. Open/Closed Principle (OCP)

Principio abierto/cerrado. Este principio propone que los componentes estén abiertos a la extensión y cerrados a la modificación, en la medida en que resulte razonable.

En el backend, el validador permite configurar reglas por campo, como longitud máxima, valores permitidos, expresiones regulares y cantidad de decimales. Esto permite modificar las restricciones de un campo o agregar reglas a una configuración sin duplicar toda la lógica de validación en cada middleware. Sin embargo, cuando se necesita incorporar un tipo de validación completamente nuevo, actualmente es posible que haya que modificar la función central para agregar la condición correspondiente. Por esa razón, la configuración de reglas favorece la extensión de las restricciones existentes, pero no elimina la necesidad de modificar el mecanismo para incorporar nuevos algoritmos.

En el frontend, `client.js` ofrece operaciones HTTP reutilizables para que los módulos consumidores utilicen una interfaz común. La función `request()` acepta opciones adicionales y las operaciones auxiliares reutilizan ese mecanismo. Esto facilita realizar distintas solicitudes sin replicar la implementación básica. No obstante, la incorporación de un nuevo comportamiento transversal, como una política de reintentos o una estrategia de autenticación diferente, podría requerir modificar el cliente. Por lo tanto, centralizar las operaciones no demuestra por sí solo un cumplimiento completo de OCP.

En términos generales, la separación entre rutas, controladores y servicios también permite incorporar funcionalidades nuevas siguiendo la organización existente. Sin embargo, no se afirma que todos los componentes puedan extenderse sin modificaciones: eso depende de cómo estén implementados y de las dependencias entre ellos.

Una alternativa futura para el validador sería separar los algoritmos en validadores independientes y seleccionarlos mediante un contrato común. Esta solución podría reducir la necesidad de modificar el núcleo del mecanismo cuando se incorporen nuevos tipos de validación.

**Evaluación**: existe una aplicación parcial de OCP mediante configuraciones reutilizables y puntos comunes de acceso. El principio no se cumple de forma completa en todos los módulos, y no se considera necesario introducir abstracciones adicionales mientras el diseño actual permita atender las necesidades del proyecto.

### 3.3. Liskov Substitution Principle (LSP)

Principio de sustitución de Liskov. Este principio establece que una implementación derivada debe poder sustituir a su tipo base sin alterar las propiedades esperadas del sistema.

En el diseño analizado no se identificó una jerarquía de clases o una familia de implementaciones intercambiables cuya sustitución permita evaluar de manera significativa este principio. El proyecto utiliza módulos y funciones para distribuir responsabilidades, pero la modularidad no implica automáticamente una aplicación de LSP.

Para analizarlo directamente sería necesario contar con tipos base, contratos o implementaciones alternativas que debieran comportarse de manera compatible. Por ejemplo, si en el futuro se incorporaran distintos proveedores de correo electrónico o diferentes implementaciones de un servicio financiero bajo un mismo contrato, sería importante comprobar que todas respetaran las condiciones y los resultados esperados de ese contrato.

**Evaluación**: no se identificó una aplicación directa de LSP que resulte central en el diseño actual. Esto no implica un incumplimiento; significa que no se encontró una jerarquía relevante para evaluar el principio con suficiente fundamento.

### 3.4. Interface Segregation Principle (ISP)

Principio de segregación de interfaces. Este principio recomienda que los componentes no dependan de interfaces que incluyan operaciones que no necesitan.

En el proyecto se utilizan módulos y funciones con responsabilidades específicas. Por ejemplo, el frontend puede consumir las operaciones HTTP expuestas por `client.js`, mientras que el backend distribuye las responsabilidades entre rutas, controladores, servicios y middlewares.

El cliente HTTP expone operaciones concretas como `get`, `post`, `put` y `del`. Esto permite que los módulos consumidores utilicen las operaciones que necesitan sin tener que implementar directamente toda la lógica de comunicación.

Sin embargo, la existencia de módulos separados no demuestra por sí sola una aplicación completa de ISP. El principio se refiere específicamente a evitar contratos demasiado amplios que obliguen a los consumidores a depender de operaciones irrelevantes para ellos. No se identificó una jerarquía de interfaces formales cuya segregación constituya una decisión central del diseño actual. Por eso, no sería correcto afirmar que el proyecto implementa ISP explícitamente solo por utilizar archivos y funciones separados.

**Evaluación**: la organización modular es compatible con el objetivo de ISP, ya que favorece el uso de responsabilidades acotadas. Sin embargo, no se identificó evidencia suficiente para afirmar una aplicación explícita del principio mediante interfaces formales.

### 3.5. Dependency Inversion Principle (DIP)

Principio de inversión de dependencias. Este principio propone que los componentes de alto nivel no dependan directamente de detalles de bajo nivel, sino de abstracciones adecuadas. A su vez, los detalles de implementación deberían depender de esas abstracciones.

En el backend, el módulo de conexión crea y configura un `pg.Pool` y exporta la instancia mediante `module.exports`. Esto evita que cada módulo tenga que configurar individualmente las conexiones a PostgreSQL y reduce la dispersión de los detalles técnicos. Sin embargo, centralizar la conexión no equivale a aplicar DIP de forma completa. Si los servicios dependen directamente de un módulo concreto de acceso a datos, siguen existiendo dependencias respecto de esa implementación, aunque su configuración esté centralizada.

En el frontend, `client.js` encapsula la comunicación HTTP y oculta a los consumidores detalles como la URL base, los encabezados, el token y el tratamiento de errores. Los módulos de `js/api/*.js` pueden utilizar las operaciones exportadas sin repetir esa lógica. No obstante, el cliente depende directamente de `fetch`, de `API_BASE_URL` y de `getToken()`. Por eso, aunque encapsula detalles técnicos y simplifica su uso, no demuestra que los módulos de alto nivel dependan de contratos independientes de las implementaciones concretas.

En ambos casos se observa una intención de encapsular detalles técnicos y ofrecer puntos de acceso compartidos. Para afirmar una inversión explícita de dependencias sería necesario verificar que los componentes de alto nivel dependan de abstracciones o contratos independientes y que las implementaciones concretas puedan sustituirse sin modificar la lógica principal.

**Evaluación**: existe una centralización de detalles técnicos que facilita el mantenimiento y reduce la duplicación. No obstante, no se afirma que toda la arquitectura implemente DIP de forma completa, ya que la centralización de una dependencia no es equivalente a invertirla.

### 3.6. Resumen del análisis SOLID

| Principio | Evaluación en el proyecto |
|---|---|
| **SRP** | Se observa separación de responsabilidades entre rutas, controladores, servicios, middlewares y configuración en el backend, así como un cliente HTTP común en el frontend. |
| **OCP** | Las reglas configurables del validador y las operaciones comunes del cliente HTTP facilitan la reutilización, aunque ciertos cambios siguen requiriendo modificar los módulos centrales. |
| **LSP** | No se identificó una jerarquía relevante de tipos o implementaciones intercambiables para evaluar su aplicación directa. |
| **ISP** | La organización modular y las operaciones específicas del cliente HTTP favorecen responsabilidades acotadas, pero no se identificó una aplicación explícita mediante interfaces formales. |
| **DIP** | Se centralizan detalles técnicos como la conexión a la base de datos y las solicitudes HTTP, pero esto no demuestra una inversión completa basada en abstracciones. |

El análisis de SOLID no busca forzar la aplicación de todos los principios. Permite identificar qué decisiones del diseño contribuyen a la mantenibilidad, cuáles representan una aplicación parcial y dónde no existe evidencia suficiente para afirmar su cumplimiento.

## 4. Decisión de diseño fundamentada

### 4.1. Problema identificado

La repetición de lógica de validación en distintos middlewares del backend generaba duplicación y dificultaba mantener criterios consistentes entre operaciones. La necesidad concreta consistía en reducir esa duplicación sin incorporar una estructura excesivamente compleja para una aplicación de alcance acotado.

### 4.2. Alternativas consideradas

Se consideraron las siguientes posibilidades.

**Alternativa A: mantener las validaciones duplicadas.**
Esta alternativa evita cambios en la estructura actual, pero mantiene la repetición de condiciones y hace que las modificaciones deban replicarse en varios lugares.

**Alternativa B: centralizar las validaciones mediante una función configurable.**
Esta alternativa permite reutilizar la lógica general, definir reglas por campo y conservar en cada middleware las particularidades de la operación.

**Alternativa C: implementar Strategy con validadores independientes.**
Esta alternativa consistiría en encapsular distintos algoritmos de validación en componentes independientes que pudieran seleccionarse mediante un contrato común. Facilitaría incorporar nuevos tipos de validación, pero también aumentaría la cantidad de abstracciones y componentes que deben mantenerse.

### 4.3. Criterios de evaluación

Las alternativas se evaluaron considerando:

- La reducción de código duplicado.
- La facilidad de mantenimiento.
- La claridad de las responsabilidades.
- La posibilidad de extender las validaciones.
- La complejidad adicional introducida.
- La correspondencia entre la solución y las necesidades reales de la aplicación.

### 4.4. Decisión adoptada

Se decidió centralizar la lógica de validación en `backend/utils/validator.js` y mantener las reglas específicas en los middlewares correspondientes. Esta decisión permite reutilizar la lógica común y reducir la duplicación, sin introducir una arquitectura de estrategias que no resulta necesaria para el alcance actual.

No se incorporó Strategy porque las validaciones requeridas pueden resolverse mediante la función configurable existente y no se identificó una necesidad concreta de intercambiar algoritmos de validación independientes. La decisión prioriza una solución comprensible, suficiente y mantenible frente a una abstracción adicional cuyo beneficio actual sería limitado.

### 4.5. Consecuencias de la decisión

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

### 4.6. Condiciones para revisar la decisión

La decisión no implica descartar Strategy de forma permanente. Podría revisarse si el proyecto incorporara muchos tipos de validación con algoritmos diferentes, si las condiciones internas del validador crecieran considerablemente o si se necesitara agregar nuevas validaciones sin modificar el mecanismo central. En ese caso, se podría evaluar una refactorización incremental hacia validadores independientes, comparando los beneficios obtenidos con el costo de implementación y mantenimiento.

## 5. Conclusiones

El análisis permitió identificar soluciones de diseño que ya aportan valor al proyecto, como la reutilización de un pool de conexiones a la base de datos y la fachada del cliente HTTP del frontend. El módulo de conexión a PostgreSQL centraliza la configuración y exporta una instancia compartida de `pg.Pool`, mientras que `client.js` ofrece una interfaz común para realizar solicitudes HTTP, incorporar el token de autenticación y gestionar las respuestas y los errores.

También se distinguió entre patrones implementados, comportamientos similares a ciertos patrones y alternativas que solo tendrían sentido ante nuevas necesidades. Esta distinción evita atribuir al sistema características que el código actual no implementa.

En relación con Clean Code, se identificó la duplicación de validaciones en el backend como una oportunidad concreta de mejora. La refactorización realizada centralizó la lógica común en un validador configurable y mantuvo las reglas específicas en los middlewares, mejorando la reutilización y la organización del código.

El análisis SOLID se amplió para considerar la arquitectura general del proyecto. Se identificó una separación de responsabilidades entre los componentes del backend y la centralización de la comunicación HTTP en el frontend. También se reconoció que algunas decisiones favorecen parcialmente la extensión del sistema, aunque no implican un cumplimiento completo de todos los principios. En particular, se distinguió entre centralizar una dependencia e invertirla, entre utilizar módulos separados y aplicar explícitamente ISP, y entre configurar reglas de validación y disponer de estrategias intercambiables. Estas diferencias permiten realizar una evaluación más precisa del diseño.

Finalmente, se decidió no introducir el patrón Strategy en el mecanismo de validación. La decisión se fundamenta en que la solución implementada responde a las necesidades actuales y evita agregar complejidad sin un beneficio proporcional.

En conclusión, el diseño se evalúa en función de los problemas que resuelve y de su adecuación al alcance del proyecto. Las futuras mejoras deberán justificarse por necesidades concretas, priorizando la legibilidad, la mantenibilidad y la simplicidad antes que la incorporación de patrones de diseño o principios arquitectónicos de manera indiscriminada.