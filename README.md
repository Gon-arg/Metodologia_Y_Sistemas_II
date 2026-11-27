# Metodología y Sistemas II - Aplicación de Finanzas Personales

Aplicación de finanzas personales compuesta por una API REST (Node.js, Express y PostgreSQL) y un frontend web en JavaScript vanilla. Permite gestionar usuarios, categorías, movimientos (ingresos y gastos) y metas de ahorro con sus aportes, y ofrece un panel con el saldo actual, un gráfico del saldo por categoría y un resumen mensual.

Proyecto desarrollado en el marco de la materia Metodología de Sistemas 2.

## Integrantes

- Ricardo Herbas
- Celina Vega
- Gonzalo Herrera

## Tabla de contenidos

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha](#puesta-en-marcha)
- [Desarrollo local sin Docker](#desarrollo-local-sin-docker)
- [Variables de entorno](#variables-de-entorno)
- [Documentación de la API](#documentación-de-la-api)
- [Frontend](#frontend)
- [Testing](#testing)
- [Calidad de código: linting y Husky](#calidad-de-código-linting-y-husky)
- [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
- [Notas y limitaciones conocidas](#notas-y-limitaciones-conocidas)
- [Documentación del proyecto](#documentación-del-proyecto)

## Características

- Registro e inicio de sesión con JWT (vigencia de 2 horas) y contraseñas hasheadas con `bcrypt`.
- Recuperación de contraseña mediante un enlace enviado por correo (Nodemailer), con vigencia de 30 minutos. El correo saluda al usuario por su nombre.
- Gestión de categorías, movimientos, metas de ahorro y aportes a metas, además de consultar, actualizar y eliminar la propia cuenta.
- Todos los endpoints, salvo los de registro, login y recuperación de contraseña, requieren token.
- Control de acceso por usuario: la API toma al usuario del token y solo permite ver y modificar sus propios movimientos, metas y aportes. Los recursos de otro usuario no se pueden leer ni modificar: la API responde `404` (o una lista vacía en los listados).
- Validación de los datos de entrada con un validador reutilizable (`utils/validator.js`) y reglas declarativas por recurso, además de manejo centralizado de errores.
- Actualización automática del progreso de cada meta mediante triggers de PostgreSQL: al insertar, editar o eliminar un aporte se recalculan `monto_actual` y `estado` (`en proceso` o `completada`).
- Entorno reproducible con Docker Compose: API, base de datos, pgAdmin y servidor web del frontend se levantan con un solo comando.
- Frontend sin build ni bundler, con dashboard, gestión de categorías, movimientos y metas, resumen mensual y perfil de usuario.
- Pruebas automatizadas: unitarias y de integración en backend (Jest y Supertest) y frontend (Jest y jsdom), más pruebas end-to-end con Playwright.
- Control de calidad con ESLint, ejecutado automáticamente antes de cada commit mediante un hook de Husky.

## Stack tecnológico

| Capa                 | Tecnología                                         |
| -------------------- | -------------------------------------------------- |
| Runtime              | Node.js 20 (Alpine)                                |
| Framework HTTP       | Express 5                                          |
| Base de datos        | PostgreSQL 17 (Alpine) con el driver `pg`          |
| Autenticación        | `jsonwebtoken` y `bcrypt`                          |
| Envío de correos     | Nodemailer (SMTP, configurado para Gmail)          |
| Administración de BD | pgAdmin 4                                          |
| Frontend             | HTML y JavaScript (ES Modules)                     |
| Estilos              | Tailwind CSS (CDN) y fuente Manrope (Google Fonts) |
| Gráficos             | Chart.js 4 (CDN)                                   |
| Servidor del front   | Nginx (Alpine)                                     |
| Contenedores         | Docker y Docker Compose                            |
| Pruebas backend      | Jest y Supertest                                   |
| Pruebas frontend     | Jest (jsdom y Babel) y Playwright (end-to-end)     |
| Calidad de código    | ESLint 10 y Husky (hook de pre-commit)             |

## Estructura del proyecto

```
.
├── docker-compose.yaml        # Orquesta API, PostgreSQL, pgAdmin y Nginx
├── .env.example               # Plantilla de variables de entorno (se copia a .env)
├── .gitignore
├── .husky/
│   └── pre-commit             # Ejecuta `npm run lint` antes de cada commit
├── package.json               # Scripts de lint y Husky (dependencia de desarrollo)
├── ANALISIS_DECISIONES_DISENO.md # Análisis de patrones, SOLID y decisiones de diseño
├── backend/
│   ├── app.js                 # Punto de entrada
│   ├── Dockerfile
│   ├── eslint.config.js       # Reglas de ESLint del backend
│   ├── package.json           # Dependencias y scripts (start, test, lint)
│   ├── core/
│   │   └── server.js          # Configuración de Express y montaje de rutas
│   ├── config/
│   │   ├── conexion-db.js     # Pool de conexión a PostgreSQL
│   │   └── conexion-email.js  # Transporte SMTP de Nodemailer
│   ├── database/
│   │   └── init.sql           # Esquema, triggers y categorías iniciales
│   ├── routes/                # Definición de endpoints por recurso
│   ├── controllers/           # Manejo de request y response
│   ├── services/              # Lógica de negocio y acceso a datos
│   ├── middlewares/           # Validadores, autenticación y manejo de errores
│   ├── utils/
│   │   ├── email.util.js      # Función para enviar correos
│   │   └── validator.js       # Validador genérico basado en reglas
│   └── tests/
│       ├── *.service.test.js  # Pruebas unitarias de los servicios
│       └── integration/       # Pruebas de integración de la API (Supertest)
└── frontend/
    ├── package.json           # Scripts de test, cobertura, lint y e2e
    ├── jest.config.cjs        # Jest con entorno jsdom y Babel
    ├── babel.config.cjs
    ├── eslint.config.cjs
    ├── playwright.config.js   # Pruebas end-to-end (baseURL http://localhost:8081)
    ├── tests/                 # Pruebas unitarias; integration/ para las de integración
    ├── e2e/                   # Pruebas end-to-end con Playwright
    ├── index.html             # Redirige a login o dashboard según la sesión
    ├── login.html
    ├── registro.html
    ├── dashboard.html
    ├── categorias.html
    ├── movimientos.html
    ├── metas.html
    ├── resumen.html
    ├── perfil.html
    ├── recuperar-contrasena.html
    ├── restablecer-password.html
    └── js/
        ├── config.js          # API_BASE_URL
        ├── tailwind-config.js # Colores y tipografía compartidos
        ├── api/               # Un módulo por recurso, todos usan client.js
        ├── components/        # navbar y sidebar
        ├── pages/             # Lógica de cada página
        ├── store/             # authStore.js (sesión en localStorage)
        └── utils/             # formatCurrency, formatDate, protectedPage
```

## Modelo de datos

El esquema, definido en `backend/database/init.sql`, contiene las siguientes tablas:

| Tabla           | Descripción                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `usuarios`      | Cuenta del usuario: nombre, email (único), `password_hash` y fecha de creación.                  |
| `categorias`    | Categorías de movimientos (nombre de hasta 50 caracteres).                                       |
| `movimientos`   | Ingresos y gastos (`tipo` es `gasto` o `ingreso`) asociados a un usuario y a una categoría.      |
| `metas_ahorro`  | Objetivos de ahorro por usuario: monto objetivo, monto actual, estado y fecha límite.            |
| `aportes_metas` | Aportes individuales a una meta (el monto debe ser mayor a 0).                                   |
| `recuperacion_password` | Tokens de recuperación de contraseña: se guarda el hash del token, su vencimiento y si ya fue usado. |

Al eliminar un usuario se eliminan en cascada sus movimientos, metas y tokens de recuperación, y al eliminar una meta se eliminan sus aportes.

Tres triggers (`trg_aportes_insert`, `trg_aportes_update` y `trg_aportes_delete`) ejecutan la función `actualizar_monto_meta`, que mantiene sincronizados `monto_actual` y `estado` de cada meta ante cualquier alta, modificación o baja de sus aportes.

El script también carga nueve categorías iniciales: Alimentos, Transporte, Servicios, Tecnología, Entretenimiento, Salud, Viaje, Ropa y Sueldo. El frontend muestra las categorías que haya en la base, así que no crea ninguna por su cuenta.

## Requisitos previos

- Docker Desktop, que ya incluye Docker Compose. En Linux sin Docker Desktop, instalar el plugin `docker-compose`.
- Node.js 20 y npm, solo si se quieren ejecutar las pruebas, el linter o el backend fuera de Docker.
- Git.

## Puesta en marcha

### Con Docker (recomendado)

```bash
git clone https://github.com/Gon-arg/Metodologia_Y_Sistemas_II
cd Metodologia_Y_Sistemas_II
cp .env.example .env
# Editar .env y definir al menos JWT_SECRET
docker compose up --build
```

El archivo `.env` va en la raíz del proyecto y es obligatorio: `docker-compose.yaml` lo usa para la API (`env_file`) y también para el usuario, la contraseña y el nombre de la base de datos y las credenciales de pgAdmin. Las credenciales SMTP solo son necesarias para la recuperación de contraseña.

Esto levanta cuatro servicios:

| Servicio   | Puerto | Descripción                                                 |
| ---------- | ------ | ----------------------------------------------------------- |
| `app`      | `3000` | API Express                                                 |
| `db`       | `5432` | PostgreSQL, inicializado con `init.sql`                     |
| `pgadmin`  | -      | Administración web de la base. No publica ningún puerto en el host |
| `frontend` | `8081` | Nginx sirviendo la carpeta `frontend/`                      |

Una vez levantado, la aplicación se abre en `http://localhost:8081`. Las credenciales de pgAdmin se definen con `PGADMIN_EMAIL` y `PGADMIN_PASSWORD` en el `.env`.

Para detener los servicios se usa `docker compose down`. El script `init.sql` solo se ejecuta la primera vez que se crea la base de datos; como el servicio `db` no define un volumen de datos, la información se pierde al eliminar el contenedor (por ejemplo con `docker compose down`) y al volver a levantar el entorno la base se recrea con el esquema y las categorías iniciales.

### Conectar pgAdmin a la base

pgAdmin no publica puertos en el host, por lo que se accede desde el contenedor. Para registrar el servidor, usar como host `db`, puerto `5432` y las credenciales `DB_USER`, `DB_PASSWORD` y `DB_NAME` del `.env`.

## Desarrollo local sin Docker

El frontend es estático y el backend lee su configuración de variables de entorno, por lo que también pueden ejecutarse por separado:

```bash
# Backend (requiere una instancia de PostgreSQL con el esquema de backend/database/init.sql)
cd backend
npm install
# Exportar las variables del .env (DB_HOST=localhost, JWT_SECRET, etc.) y luego:
npm start

# Frontend (cualquier servidor estático, por ejemplo)
cd frontend
npx serve .
```

Si se usa otro puerto u origen para el backend, actualizar `API_BASE_URL` en `frontend/js/config.js`. Como el backend no carga el archivo `.env` por su cuenta, las variables deben estar definidas en el entorno de la terminal antes de iniciarlo.

## Variables de entorno

Se configuran en el archivo `.env` de la raíz del proyecto (hay una plantilla en `.env.example`). El backend no tiene valores por defecto ni lee un archivo `.env` por su cuenta: recibe las variables desde Docker Compose. Las variables `SMTP_*` solo son necesarias para la recuperación de contraseña.

| Variable          | Descripción                                                              | Valor de ejemplo                  |
| ----------------- | ------------------------------------------------------------------------ | --------------------------------- |
| `PORT`            | Puerto en el que escucha la API                                          | `3000`                            |
| `JWT_SECRET`      | Clave para firmar y verificar los JWT (obligatoria, reemplazar el ejemplo) | `tu_secreto_jwt`                |
| `DB_HOST`         | Host de PostgreSQL (con Docker, el nombre del servicio)                  | `db`                              |
| `DB_PORT`         | Puerto de PostgreSQL                                                     | `5432`                            |
| `DB_USER`         | Usuario de PostgreSQL                                                    | `user`                            |
| `DB_PASSWORD`     | Contraseña de PostgreSQL                                                 | `1234`                            |
| `DB_NAME`         | Nombre de la base de datos                                               | `miapp`                           |
| `SMTP_HOST`       | Servidor SMTP para el envío de correos                                   | `smtp.gmail.com`                  |
| `SMTP_PORT`       | Puerto del servidor SMTP                                                 | `587`                             |
| `SMTP_USER`       | Cuenta de correo desde la que se envían los mensajes                     | `tu_correo@gmail.com`             |
| `SMTP_PASSWORD`   | Contraseña de la cuenta (en Gmail, una contraseña de aplicación)         | `tu_contraseña_de_aplicacion`     |
| `PGADMIN_EMAIL`   | Email de acceso a pgAdmin                                                | `admin@admin.com`                 |
| `PGADMIN_PASSWORD`| Contraseña de acceso a pgAdmin                                           | `admin`                           |
| `FRONTEND_URL`    | URL base del frontend, usada en el enlace del correo de recuperación     | `http://localhost:8081`           |

## Documentación de la API

URL base: `http://localhost:3000/api`

Los endpoints protegidos requieren el header `Authorization: Bearer <token>`. En usuarios, movimientos, metas y aportes, el usuario se toma siempre del token (nunca de la URL ni del body), y el recurso de otro usuario se trata como inexistente (`404`, o una lista vacía en los listados). Los errores de validación responden con estado `400` y un cuerpo `{ "error": [...] }`. La excepción es `/categorias`, que responde `{ "errors": [...] }`.

Reglas de validación comunes: los montos deben ser mayores a 0 y tener como máximo 2 decimales, las fechas usan el formato `YYYY-MM-DD` y las contraseñas deben tener al menos 6 caracteres. En las actualizaciones (`PUT`) de usuarios, movimientos, metas y aportes alcanza con enviar los campos que cambian; en categorías el nombre es obligatorio.

### Autenticación - `/auth`

| Método | Ruta                       | Descripción                                  | Body                                    | Token |
| ------ | -------------------------- | -------------------------------------------- | --------------------------------------- | ----- |
| POST   | `/auth/registrar`          | Crea un usuario                              | `{ nombre, email, password }`           | No    |
| POST   | `/auth/login`              | Inicia sesión y devuelve usuario y token     | `{ email, password }`                   | No    |
| POST   | `/auth/recuperar-password` | Envía por correo un enlace de recuperación   | `{ email }`                             | No    |
| POST   | `/auth/restablecer-password` | Establece una nueva contraseña con el token del correo | `{ token, nuevaPassword }`   | No    |
| GET    | `/auth/perfil`             | Devuelve el perfil del usuario autenticado   |                                         | Sí    |

### Usuarios - `/usuarios`

| Método | Ruta            | Descripción                                                          |
| ------ | --------------- | -------------------------------------------------------------------- |
| GET    | `/usuarios/:id` | Devuelve los datos del usuario autenticado                           |
| PUT    | `/usuarios/:id` | Actualiza al usuario autenticado (`nombre`, `email` y/o `password`)  |
| DELETE | `/usuarios/:id` | Elimina al usuario autenticado                                       |

Los tres endpoints actúan siempre sobre el usuario del token: el `:id` de la URL se ignora. Las altas se hacen con `/auth/registrar`.

### Categorías - `/categorias`

Las categorías son compartidas por todos los usuarios.

| Método | Ruta              | Descripción                       |
| ------ | ----------------- | --------------------------------- |
| GET    | `/categorias`     | Lista todas las categorías        |
| GET    | `/categorias/:id` | Obtiene una categoría por id      |
| POST   | `/categorias`     | Crea una categoría (`{ nombre }`) |
| PUT    | `/categorias/:id` | Actualiza una categoría           |
| DELETE | `/categorias/:id` | Elimina una categoría             |

### Movimientos - `/movimientos`

| Método | Ruta                                   | Descripción                                                                          |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------------ |
| GET    | `/movimientos`                         | Lista los movimientos del usuario autenticado                                        |
| GET    | `/movimientos/categoria/:categoria_id` | Movimientos del usuario autenticado en una categoría                                 |
| GET    | `/movimientos/:id`                     | Obtiene un movimiento propio por id                                                  |
| POST   | `/movimientos`                         | Crea un movimiento (`{ usuario_id, categoria_id, tipo, monto, descripcion, fecha }`) |
| PUT    | `/movimientos/:id`                     | Actualiza un movimiento                                                              |
| DELETE | `/movimientos/:id`                     | Elimina un movimiento                                                                |

El campo `tipo` acepta únicamente `"gasto"` o `"ingreso"`. En el alta, `usuario_id` es obligatorio para la validación pero se ignora (el movimiento se crea a nombre del usuario del token) y `fecha` es obligatoria en la práctica.

### Metas de ahorro - `/metas-ahorro`

| Método | Ruta                                | Descripción                                                            |
| ------ | ----------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/metas-ahorro`                     | Lista las metas del usuario autenticado                                |
| GET    | `/metas-ahorro/:id`                 | Obtiene una meta propia por id                                         |
| POST   | `/metas-ahorro`                     | Crea una meta (`{ usuario_id, nombre, monto_objetivo, fecha_limite }`) |
| PUT    | `/metas-ahorro/:id`                 | Actualiza una meta                                                     |
| DELETE | `/metas-ahorro/:id`                 | Elimina una meta                                                       |

En el alta, `usuario_id` es obligatorio para la validación pero se ignora: la meta se crea a nombre del usuario del token.

### Aportes a metas - `/aportes-metas`

| Método | Ruta                           | Descripción                                        |
| ------ | ------------------------------ | -------------------------------------------------- |
| GET    | `/aportes-metas`               | Lista los aportes de las metas del usuario autenticado |
| GET    | `/aportes-metas/meta/:meta_id` | Aportes de una meta propia                         |
| GET    | `/aportes-metas/:id`           | Obtiene un aporte propio por id                    |
| POST   | `/aportes-metas`               | Crea un aporte (`{ meta_id, monto, descripcion }`) |
| PUT    | `/aportes-metas/:id`           | Actualiza un aporte                                |
| DELETE | `/aportes-metas/:id`           | Elimina un aporte                                  |

## Frontend

Está ubicado en `frontend/`. Es un frontend vanilla (HTML y JavaScript con ES Modules), sin bundler ni dependencias de `npm`. Tailwind CSS, Chart.js y la fuente Manrope se cargan desde CDN, por lo que se necesita conexión a internet para verlo correctamente.

### Cómo está armado

- `js/config.js` define `API_BASE_URL` (por defecto `http://localhost:3000/api`). Es el único lugar a modificar si el backend corre en otra URL.
- `js/tailwind-config.js` centraliza la paleta de colores y la tipografía que comparten todas las páginas.
- `js/api/client.js` es un wrapper sobre `fetch` usado por todos los módulos de `js/api/`. Arma la URL completa, agrega el header `Authorization: Bearer <token>` cuando hay sesión, parsea el JSON y normaliza los mensajes de error del backend.
- `js/store/authStore.js` guarda el token y los datos del usuario en `localStorage` (`finanzas_token` y `finanzas_usuario`) y expone `isAuthenticated()`.
- `js/utils/protectedPage.js` se usa como primera línea de cada página privada y redirige a `login.html` si no hay sesión.
- Cada página HTML tiene su propio script en `js/pages/` (por ejemplo, `dashboard.html` corresponde a `js/pages/dashboard.js`) y comparte los componentes `navbar` (iniciales del usuario con un menú con Datos personales, Claves y seguridad y cierre de sesión) y `sidebar` (navegación entre Dashboard, Categorías, Movimientos, Metas ahorro y Resumen).

### Páginas

| Página             | Descripción                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `index.html`       | Redirige a `login.html` o `dashboard.html` según haya sesión                                                       |
| `login.html`       | Inicio de sesión, con enlace a la recuperación de contraseña. Si ya hay sesión, redirige al dashboard             |
| `registro.html`    | Alta de usuario                                                                                                    |
| `dashboard.html`   | Saldo actual, formulario para ingresar el saldo inicial (una sola vez) y gráfico de torta del saldo por categoría (ingresos menos gastos, solo categorías con saldo positivo) |
| `categorias.html`  | Categorías cargadas desde la base, creación de categorías propias y carga de movimientos (gasto o ingreso) sobre la categoría elegida |
| `movimientos.html` | Listado de movimientos del usuario, con filtro por gasto o ingreso y eliminación                                   |
| `metas.html`       | Alta y baja de metas de ahorro, con detalle expandible y alta y baja de aportes                                    |
| `resumen.html`     | Consultas rápidas calculadas en el navegador: gasto del mes, categoría con más gasto, comparación con el mes anterior y avance de metas |
| `perfil.html`      | Muestra nombre y email, y una sección a la vez: datos personales (`#datos`) o claves y seguridad (`#seguridad`)    |
| `recuperar-contrasena.html` | Pide el email y envía el enlace de recuperación                                                           |
| `restablecer-password.html` | Destino del enlace del correo: recibe el token por la URL y permite elegir una nueva contraseña           |

### Módulos de API

Cada módulo de `frontend/js/api/` agrupa las llamadas a un recurso del backend y usa `client.js`. Devuelven el JSON que manda la API tal cual y, si la respuesta es un error, lanzan un `Error` con el mensaje.

| Módulo           | Función                                          | Llamada                                   |
| ---------------- | ------------------------------------------------ | ----------------------------------------- |
| `auth.js`        | `login(email, password)`                         | `POST /auth/login`                        |
|                  | `registrar(nombre, email, password)`             | `POST /auth/registrar`                    |
|                  | `getPerfil()`                                    | `GET /auth/perfil`                        |
|                  | `recuperarPassword(email)`                       | `POST /auth/recuperar-password`           |
|                  | `restablecerPassword(token, nuevaPassword)`      | `POST /auth/restablecer-password`         |
| `usuarios.js`    | `actualizar(id, datos)`                          | `PUT /usuarios/:id`                       |
| `categorias.js`  | `obtenerTodas()`                                 | `GET /categorias`                         |
|                  | `obtenerPorId(id)`                               | `GET /categorias/:id`                     |
|                  | `crear(datos)`                                   | `POST /categorias`                        |
|                  | `actualizar(id, datos)`                          | `PUT /categorias/:id`                     |
|                  | `eliminar(id)`                                   | `DELETE /categorias/:id`                  |
| `movimientos.js` | `obtenerTodos()` y `obtenerPorUsuario()`         | `GET /movimientos` (ambas hacen lo mismo) |
|                  | `obtenerPorCategoria(categoriaId)`               | `GET /movimientos/categoria/:id`          |
|                  | `obtenerPorId(id)`                               | `GET /movimientos/:id`                    |
|                  | `crear(datos)`                                   | `POST /movimientos`                       |
|                  | `actualizar(id, datos)`                          | `PUT /movimientos/:id`                    |
|                  | `eliminar(id)`                                   | `DELETE /movimientos/:id`                 |
| `metasAhorro.js` | `obtenerTodas()` y `obtenerPorUsuario()`         | `GET /metas-ahorro` (ambas hacen lo mismo) |
|                  | `obtenerPorId(id)`                               | `GET /metas-ahorro/:id`                   |
|                  | `crear(datos)`                                   | `POST /metas-ahorro`                      |
|                  | `actualizar(id, datos)`                          | `PUT /metas-ahorro/:id`                   |
|                  | `eliminar(id)`                                   | `DELETE /metas-ahorro/:id`                |
| `aportesMetas.js`| `obtenerPorMeta(metaId)`                         | `GET /aportes-metas/meta/:id`             |
|                  | `crear(datos)`                                   | `POST /aportes-metas`                     |
|                  | `eliminar(id)`                                   | `DELETE /aportes-metas/:id`               |

El frontend todavía no usa los endpoints `GET /aportes-metas` ni `PUT /aportes-metas/:id`, y tampoco tiene funciones para ellos.

## Testing

El proyecto incluye pruebas automatizadas en ambas capas. Las del backend y las unitarias y de integración del frontend no necesitan base de datos ni servidor levantado, porque simulan (mock) la conexión a PostgreSQL y las llamadas a la API.

| Capa     | Tipo        | Herramientas        | Ubicación                         | Comando                                     |
| -------- | ----------- | ------------------- | --------------------------------- | ------------------------------------------- |
| Backend  | Unitarias   | Jest                | `backend/tests/*.service.test.js` | `npm test` (dentro de `backend/`)           |
| Backend  | Integración | Jest y Supertest    | `backend/tests/integration/`      | `npm test` (dentro de `backend/`)           |
| Frontend | Unitarias   | Jest y jsdom        | `frontend/tests/`                 | `npm test` (dentro de `frontend/`)          |
| Frontend | Integración | Jest y jsdom        | `frontend/tests/integration/`     | `npm test` (dentro de `frontend/`)          |
| Frontend | End-to-end  | Playwright          | `frontend/e2e/`                   | `npm run test:e2e` (dentro de `frontend/`)  |

### Backend

```bash
cd backend
npm install
npm test
```

Cubre los servicios de autenticación, usuarios, movimientos, metas de ahorro y aportes, y la API completa de movimientos y aportes a metas a través de Supertest, con la conexión a la base reemplazada por un mock.

### Frontend

```bash
cd frontend
npm install
npm test                # Pruebas unitarias y de integración
npm run test:watch      # Modo observador
npm run test:coverage   # Con informe de cobertura (carpeta coverage/)
```

Cubre el cliente HTTP, el almacén de sesión, la protección de páginas, las utilidades de formato (moneda y fecha), los módulos de API de cada recurso y los flujos de inicio de sesión, categorías, movimientos y metas.

### Pruebas end-to-end

Las pruebas de `frontend/e2e/` usan Playwright con Chromium y sí requieren el entorno completo levantado (`docker compose up`), con el frontend en `http://localhost:8081`. Además, esperan que exista el usuario `pedro@gmail.com` con contraseña `12345678`, que debe registrarse antes desde `registro.html`.

```bash
cd frontend
npm install
npx playwright install chromium   # Solo la primera vez
npm run test:e2e
```

Escenarios cubiertos: inicio de sesión con acceso al dashboard y registro de un gasto que luego aparece en el listado de movimientos.

## Calidad de código: linting y Husky

El código se revisa con ESLint (`eslint:recommended`), con una configuración propia para el backend (CommonJS) y otra para el frontend (ES Modules en el navegador).

```bash
npm run lint            # Desde la raíz: backend y frontend
npm run lint:backend
npm run lint:frontend
```

Husky ejecuta `npm run lint` automáticamente antes de cada `git commit` (hook `.husky/pre-commit`), y el commit se cancela si el linter encuentra errores. Para que el hook quede instalado, ejecutar `npm install` en la raíz del proyecto una vez después de clonar el repositorio (el script `prepare` lo activa). Las dependencias de `backend/` y `frontend/` se instalan por separado con `npm install` en cada carpeta.

## Flujo de trabajo con Git

El repositorio se organiza con ramas de corta duración que se integran a `main` mediante Pull Requests, con prefijos según el tipo de cambio:

| Prefijo     | Uso                                                     |
| ----------- | ------------------------------------------------------- |
| `feature/`  | Nuevas funcionalidades                                  |
| `fix/`      | Corrección de errores                                   |
| `chore/`    | Configuración, tooling y tareas de mantenimiento        |
| `test/`     | Incorporación o ampliación de pruebas                   |
| `docs/`     | Cambios en la documentación                             |

Los mensajes de commit siguen el formato `tipo: descripción` (por ejemplo, `test: agregar pruebas de formato de moneda y fecha`).

## Notas y limitaciones conocidas
- La URL de la API está fija en `frontend/js/config.js`. Si el backend no corre en `localhost:3000`, hay que editarla ahí.
- El backend habilita `cors()` sin restricciones, por lo que cualquier origen puede consumirlo. Conviene restringirlo en producción.
- La base de datos no persiste datos entre recreaciones del contenedor (no hay volumen definido para PostgreSQL) y el puerto `5432` queda publicado en el host. Para un entorno real conviene agregar un volumen y no exponer el puerto.
- Las credenciales de ejemplo de `.env.example` (`DB_PASSWORD`, `PGADMIN_PASSWORD`, `JWT_SECRET`) son solo para desarrollo y deben reemplazarse.
- Las pruebas end-to-end dependen de datos previos (el usuario `pedro@gmail.com`) y del entorno levantado, por lo que no se ejecutan de forma autónoma.
- Se crearon las ramas feature/ia-backend y feature/optimizacion-ia-backend como base para futuras modificaciones de la aplicación. Estas funcionalidades no se integraron en la versión actual del proyecto. Quedan como trabajo pendiente para una posible implementación de un modelo de inteligencia artificial que actúe como asistente de la aplicación, junto con las optimizaciones relacionadas con su funcionamiento.

## Documentación del proyecto

- [Análisis de decisiones de diseño](./ANALISIS_DECISIONES_DISENO.md): análisis de patrones de diseño, Clean Code, code smells, refactoring, principios SOLID y justificación de las decisiones adoptadas.