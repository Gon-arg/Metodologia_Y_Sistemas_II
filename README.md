# Metodolog-a-Y-Sistemas-II


**Integrantes del Proyecto:**
- Ricardo Herbas
- Celina Vega
- Gonzalo Herrera

Aplicación de **finanzas personales** compuesta por una API REST (Node.js, Express y PostgreSQL) y un frontend web. Permite gestionar usuarios, categorías, movimientos (ingresos/gastos) y metas de ahorro, e incluye un asistente de **IA en lenguaje natural** (vía Ollama) que responde preguntas sobre las finanzas del usuario generando y ejecutando SQL de forma automática.

## Tabla de contenidos

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Documentación de la API](#documentación-de-la-api)
- [Asistente de IA](#asistente-de-ia)
- [Frontend](#frontend)
- [Notas y consideraciones](#notas-y-consideraciones)

## Características

- **Autenticación** de usuarios con JWT y contraseñas hasheadas con `bcrypt`.
- **CRUD completo** de usuarios, categorías, movimientos, metas de ahorro y aportes a metas.
- **Actualización automática** del progreso de una meta de ahorro mediante triggers de PostgreSQL: cada vez que se inserta, edita o elimina un aporte, se recalcula `monto_actual` y el `estado` (`en proceso` / `completada`).
- **Consultas en lenguaje natural**: el endpoint de IA traduce una pregunta en español a una consulta SQL segura (scoped al usuario), la ejecuta contra la base y devuelve una respuesta en lenguaje natural.
- **Entorno reproducible** con Docker Compose: API, base de datos, pgAdmin y el motor de IA (Ollama) levantan con un solo comando.
- **Frontend web** en JavaScript vanilla (sin frameworks) con dashboard, gestión de movimientos/categorías/metas y una pantalla de asistente de IA.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 20 (Alpine) |
| Framework HTTP | Express 5 |
| Base de datos | PostgreSQL 17 |
| Autenticación | JWT (`jsonwebtoken`) + `bcrypt` |
| IA / LLM | Ollama (`qwen2.5-coder:14b`) |
| Administración de BD | pgAdmin 4 |
| Frontend | HTML + CSS + JavaScript (ES Modules), sin frameworks ni bundler |
| Contenedores | Docker / Docker Compose |

## Estructura del proyecto

```
metodologia/
├── docker-compose.yaml        # Orquesta API, PostgreSQL, pgAdmin y Ollama
├── backend/
│   ├── app.js                 # Punto de entrada
│   ├── Dockerfile
│   ├── core/
│   │   └── server.js          # Configuración de Express y montaje de rutas
│   ├── config/
│   │   ├── conexion-db.js      # Pool de conexión a PostgreSQL
│   │   └── conexion-ia.js      # Cliente HTTP contra Ollama
│   ├── database/
│   │   └── init.sql            # Esquema, triggers y datos de ejemplo
│   ├── routes/                 # Definición de endpoints por recurso
│   ├── controllers/            # Manejo de request/response
│   ├── services/                # Lógica de negocio y acceso a datos
│   └── middlewares/             # Validación de inputs, autenticación y manejo de errores
└── front/
    ├── index.html                  # Redirige a login o dashboard según sesión
    ├── login.html / registro.html
    ├── dashboard.html
    ├── movimientos.html
    ├── categorias.html
    ├── metas.html / meta-detalle.html
    ├── asistente-ia.html
    ├── perfil.html
    ├── css/                          # reset, variables, layout, components, pages
    └── js/
        ├── config.js                  # API_BASE_URL de la API
        ├── api/                        # un módulo por recurso, todos usan client.js
        ├── components/                 # navbar, sidebar, modal, chatBubble, etc.
        ├── pages/                      # lógica de cada página (una por HTML)
        ├── store/                      # authStore.js (sesión en localStorage)
        └── utils/                      # formatCurrency, formatDate, protectedPage, etc.
```

## Modelo de datos

El esquema (`backend/database/init.sql`) define las siguientes tablas:

- **usuarios** — cuenta del usuario (nombre, email, password_hash).
- **categorias** — categorías de gasto/ingreso (ej. Comida, Transporte).
- **movimientos** — ingresos y gastos, asociados a un usuario y una categoría.
- **metas_ahorro** — objetivos de ahorro por usuario (monto objetivo, monto actual, estado, fecha límite).
- **aportes_metas** — aportes individuales realizados a una meta de ahorro.

Un trigger (`actualizar_monto_meta`) mantiene sincronizado `monto_actual` y `estado` de cada meta ante cualquier alta, baja o modificación de sus aportes.

## Requisitos previos

- [Docker Desktop](https://www.docker.com/) (ya incluye Docker Compose; en Linux sin Docker Desktop, instalar el plugin `docker-compose`)
- (Opcional, para correr sin Docker) Node.js 20+ y una instancia de PostgreSQL 17

## Puesta en marcha

### Con Docker (recomendado)

```bash
git clone https://github.com/Gon-arg/Metodologia_Y_Sistemas_II
cd Metodologia_Y_Sistemas_II
docker compose up --build
```

Esto levanta cuatro servicios:

| Servicio | Puerto | Descripción |
|---|---|---|
| `app` | `3000` | API Express |
| `db` | `5432` | PostgreSQL (se inicializa con `init.sql`) |
| `pgadmin` | `8080` | Administración web de la base (`admin@admin.com` / `admin`) |
| `ollama` | `11434` | Motor de inferencia para el asistente de IA |

> **Primer arranque:** el contenedor `ollama` no trae el modelo `qwen2.5-coder:14b` preinstalado. Antes de usar el endpoint de IA, descargalo dentro del contenedor:
> ```bash
> docker exec -it ollama ollama pull qwen2.5-coder:14b
> ```

### Sin Docker

```bash
cd backend
npm install
# Configurar variables de entorno (ver sección siguiente)
# y tener PostgreSQL + Ollama corriendo y accesibles
npm start
```

### Frontend

El frontend es HTML/CSS/JS sin build ni dependencias, pero usa **ES Modules** (`import`/`export`), por lo que no se puede abrir el `.html` directamente con doble clic (`file://`): hay que servirlo con un servidor HTTP estático. Con el backend ya corriendo en `http://localhost:3000` (ver más arriba):

```bash
git checkout gonza   # o clonar esa rama
cd finanzas-frontend-vanilla/finanzas-frontend-vanilla
npx serve .          # o: python3 -m http.server 5500
```

Luego abrí la URL que indique el servidor (por ejemplo `http://localhost:5500`) — `index.html` redirige automáticamente a `login.html` o `dashboard.html` según si hay sesión guardada.

## Variables de entorno

Configurables en `backend/.env` (o como variables de entorno del contenedor `app`):

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto en el que escucha la API | `3000` |
| `DB_HOST` | Host de PostgreSQL | `db` |
| `DB_USER` | Usuario de PostgreSQL | `user` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `1234` |
| `DB_NAME` | Nombre de la base de datos | `miapp` |
| `OLLAMA_URL` | URL del servidor de Ollama | `http://ollama:11434` |
| `JWT_SECRET` | Clave usada para firmar/verificar los JWT | *(requerida, sin valor por defecto)* |

## Documentación de la API

Base URL: `http://localhost:3000/api`

### Autenticación — `/auth`

| Método | Ruta | Descripción | Body |
|---|---|---|---|
| POST | `/auth/registrar` | Crea un usuario y devuelve token | `{ nombre, email, password }` |
| POST | `/auth/login` | Inicia sesión y devuelve token | `{ email, password }` |
| GET | `/auth/perfil` | Devuelve el perfil del usuario autenticado | Header `Authorization: Bearer <token>` |

### Usuarios — `/usuarios`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/usuarios` | Lista todos los usuarios |
| GET | `/usuarios/:id` | Obtiene un usuario por id |
| POST | `/usuarios` | Crea un usuario |
| PUT | `/usuarios/:id` | Actualiza un usuario |
| DELETE | `/usuarios/:id` | Elimina un usuario |

### Categorías — `/categorias`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/categorias` | Lista todas las categorías |
| GET | `/categorias/:id` | Obtiene una categoría por id |
| POST | `/categorias` | Crea una categoría (`{ nombre }`) |
| PUT | `/categorias/:id` | Actualiza una categoría |
| DELETE | `/categorias/:id` | Elimina una categoría |

### Movimientos — `/movimientos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/movimientos` | Lista todos los movimientos |
| GET | `/movimientos/usuario/:usuario_id` | Movimientos de un usuario |
| GET | `/movimientos/categoria/:categoria_id` | Movimientos de una categoría |
| GET | `/movimientos/:id` | Obtiene un movimiento por id |
| POST | `/movimientos` | Crea un movimiento (`{ usuario_id, categoria_id, tipo, monto, descripcion, fecha }`) |
| PUT | `/movimientos/:id` | Actualiza un movimiento |
| DELETE | `/movimientos/:id` | Elimina un movimiento |

`tipo` acepta únicamente `"gasto"` o `"ingreso"`.

### Metas de ahorro — `/metas-ahorro`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/metas-ahorro` | Lista todas las metas |
| GET | `/metas-ahorro/usuario/:usuario_id` | Metas de un usuario |
| GET | `/metas-ahorro/:id` | Obtiene una meta por id |
| POST | `/metas-ahorro` | Crea una meta (`{ usuario_id, nombre, monto_objetivo, fecha_limite }`) |
| PUT | `/metas-ahorro/:id` | Actualiza una meta |
| DELETE | `/metas-ahorro/:id` | Elimina una meta |

### Aportes a metas — `/aportes-metas`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/aportes-metas` | Lista todos los aportes |
| GET | `/aportes-metas/meta/:meta_id` | Aportes de una meta puntual |
| GET | `/aportes-metas/:id` | Obtiene un aporte por id |
| POST | `/aportes-metas` | Crea un aporte (`{ meta_id, monto, descripcion }`) |
| PUT | `/aportes-metas/:id` | Actualiza un aporte |
| DELETE | `/aportes-metas/:id` | Elimina un aporte |

### Asistente de IA — `/ia`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/ia/consultar` | Responde una pregunta en lenguaje natural sobre las finanzas del usuario |

## Asistente de IA

El endpoint `POST /api/ia/consultar` recibe una pregunta en español junto con el id del usuario, arma el contexto de la base de datos del usuario (esquema, categorías, metas, resumen financiero), le pide a un modelo corriendo en Ollama que genere una única consulta `SELECT`, la ejecuta y devuelve una respuesta en lenguaje natural.

**Request:**

```json
{
  "pregunta": "¿Cuánto gasté en comida este mes?",
  "usuarioId": 1
}
```

**Response:**

```json
{
  "pregunta": "¿Cuánto gasté en comida este mes?",
  "sql": "SELECT SUM(monto) ...",
  "resultado": [ { "sum": "1200.50" } ],
  "respuesta": "Este mes gastaste $1200.50 en comida."
}
```

Reglas aplicadas al generar el SQL: las consultas quedan siempre filtradas por el `usuarioId` recibido, nunca se expone `password_hash`, y solo se permiten consultas `SELECT`/`WITH`.

## Frontend

Está dentro de `finanzas-frontend-vanilla/finanzas-frontend-vanilla/`. Es un frontend **vanilla** (HTML + CSS + JavaScript con ES Modules), sin frameworks, sin bundler y sin dependencias de `npm`.

### Cómo está armado

- **`js/config.js`** define `API_BASE_URL` (por defecto `http://localhost:3000/api`). Es el único lugar a tocar si el backend corre en otra URL.
- **`js/api/client.js`** es un wrapper sobre `fetch` usado por todos los módulos de `js/api/`: arma la URL completa, agrega el header `Authorization: Bearer <token>` cuando hay sesión, parsea JSON y normaliza los mensajes de error del backend.
- **`js/store/authStore.js`** guarda el token y los datos del usuario en `localStorage` (`finanzas_token`, `finanzas_usuario`) y expone `isAuthenticated()`.
- **`js/utils/protectedPage.js`** se importa como primera línea de cada página privada: si no hay sesión, redirige a `login.html`.
- Cada página HTML tiene su propio script en `js/pages/` (ej. `dashboard.html` ↔ `js/pages/dashboard.js`), y comparte componentes de `js/components/` como el `navbar` (usuario + logout) y el `sidebar` (navegación entre Dashboard, Movimientos, Categorías, Metas, Asistente IA y Perfil).

### Páginas

| Página | Descripción |
|---|---|
| `login.html` | Inicio de sesión |
| `registro.html` | Alta de usuario |
| `dashboard.html` | Resumen de ingresos/gastos, gasto por categoría y metas activas |
| `movimientos.html` | Listado y carga de movimientos |
| `categorias.html` | Listado y alta de categorías |
| `metas.html` / `meta-detalle.html` | Metas de ahorro y detalle con sus aportes |
| `asistente-ia.html` | Chat contra el endpoint de IA del backend |
| `perfil.html` | Datos del usuario logueado |

### Estado actual

A la fecha, no todo el frontend está implementado con la misma profundidad:

- **Con lógica funcionando:** login, registro, dashboard (resumen + gastos por categoría + metas activas), navbar, sidebar, y los módulos de API de autenticación, categorías y movimientos/metas de ahorro.
- **Como esqueleto/pendiente de implementar:** las páginas de movimientos, categorías, metas, detalle de meta, perfil y asistente de IA, junto con varios componentes (`modal`, `metaCard`, `movimientoItem`, `chatBubble`) y módulos de API (`ia.js`, `aportesMetas.js`, `usuarios.js`) están creados solo con un comentario que describe qué deberían hacer, sin código todavía.

## Notas y consideraciones

- Las credenciales por defecto en `docker-compose.yaml` (Postgres, pgAdmin) son valores de desarrollo; reemplazalas antes de exponer el proyecto fuera de un entorno local.
- `JWT_SECRET` es obligatoria: sin definirla, la verificación de tokens fallará.
- El endpoint `POST /api/ia/consultar` valida que el usuario indicado exista y aísla los datos por `usuarioId`, pero actualmente se expone sin exigir un token válido (el middleware `verificarToken` está comentado en `routes/ia.route.js`).
- El frontend tiene la URL de la API **hardcodeada** en `js/config.js`; si el backend no corre en `localhost:3000`, hay que editarla ahí.
- El backend habilita `cors()` sin restricciones, así que el frontend puede consumirlo desde cualquier origen/puerto en desarrollo.
- Proyecto desarrollado en el marco de la materia *Metodología de Sistemas 2*.
