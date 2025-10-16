# Kinder Web (Angular 18)

Aplicación para gestionar estudiantes y asistencia con Angular 18 (standalone + signals), tema oscuro y Bootstrap 5. Incluye widget de clima con OpenWeather, selector de fecha reutilizable y persistencia en localStorage.

## Índice
- Requisitos y arranque rápido
- Estructura del proyecto
- Funcionalidades por página
- Servicios y componentes compartidos
- Configuración de OpenWeather (runtime env.js)
- Uso y tips
- Troubleshooting (errores comunes)

---

## Requisitos y arranque rápido
- Node 18+
- Angular CLI instalado globalmente (opcional para usar `ng`)
- API Key de OpenWeather (gratuita): https://openweathermap.org/api

Arranque:

```powershell
npm install
npm start
```

Build de producción:

```powershell
npm run build
```

---

## Estructura del proyecto

Nivel raíz
- `angular.json`: configuración de Angular (builder, assets, estilos). Bootstrap se referencia aquí.
- `package.json`: scripts (`start`, `build`) y dependencias.
- `tsconfig.json` / `tsconfig.app.json`: configuración TypeScript; incluye `src/polyfills.ts`.
- `README.md`: este documento.

`src/`
- `index.html`: HTML base. Carga `assets/env.js` y calcula `--header-h` (altura del header) para evitar solape.
- `main.ts`: bootstrap de la app (standalone), `provideHttpClient(withFetch())` y router.
- `polyfills.ts`: importa `zone.js`.
- `styles.css`: estilos globales (tema oscuro, ajustes Bootstrap, padding-top con `--header-h`).

`src/assets/`
- `env.js`: variables en runtime. Ejemplo:
  ```js
  window.__env = {
    OPENWEATHER_API_KEY: 'TU_API_KEY'
  };
  ```

`src/environments/`
- `environment.ts`: fallback para configuraciones (ej. cuando no existe `window.__env`). No subas claves reales aquí.

`src/app/`
- `app.component.ts`: shell de la app (header + router-outlet).
- `app.routes.ts`: rutas a Home, Asistencia, Reporte y Estudiantes.

`src/app/core/`
- `models.ts`: tipos `Student`, `AttendanceRecord`, `AttendanceRow`, etc.
- `attendance.service.ts`: CRUD de estudiantes y asistencia en localStorage, cálculo de porcentaje y fechas recientes.
- `weather.service.ts`: OpenWeather (clima actual, pronóstico, geocoding), caché y manejo de errores.
- `city.service.ts`: signal de ciudad y últimas ciudades usadas (localStorage).

`src/app/shared/`
- `header/`: header fijo con selector de ciudad y botones de recientes.
- `date-picker/`: selector de fecha standalone, `(fechaChange)` emite `yyyy-MM-dd`.
- `weather-widget/`: widget de clima actual + pronóstico, mensajes de error, alerta de lluvia.

`src/app/pages/`
- `home/`: tarjetas de alumnos (foto, nombre, edad, nacimiento). Botón “Descripción” abre modal. `+ Agregar estudiante` con URL de foto y descripción.
- `attendance/`: flujo de asistencia en dos pasos: 1) fecha con `app-date-picker`, 2) tabla para marcar Presente/Ausente y comentario. Guarda en localStorage y lista últimas fechas.
- `report/`: selector de fecha, navegación Anterior/Siguiente entre fechas recientes, porcentaje de asistencia y tabla del registro. Mensaje si no hay registro.
- `students/`: alta y edición de estudiantes con descripción e imagen. Soporta archivo y drag & drop (previsualización y quitar imagen). Lista con avatar circular.

---

## Servicios y componentes compartidos
- `AttendanceService`: gestiona `students`, `attendanceRecords`, `recentAdded` en localStorage. Provee métricas (porcentaje), lookup por fecha y lista de recientes.
- `WeatherService`: obtiene clima y pronóstico usando HttpClient+fetch. Toma API key de `window.__env` o `environment`. Cachea y maneja errores con defaults seguros.
- `CityService`: ciudad actual y recientes con señales; persistencia local.
- `HeaderComponent`: navegación y selector de ciudad.
- `DatePickerComponent`: pequeño calendario custom; inputs `[fechaISO]`, `[min]`, `[max]`, output `(fechaChange)`.
- `WeatherWidgetComponent`: muestra clima, pronóstico y alerta de lluvia; mensajes útiles si falta API key o hay problemas.

---

## Configuración de OpenWeather (runtime env.js)
1) Crear/editar `src/assets/env.js` (ya existe) y setear tu API key:

```js
window.__env = {
  OPENWEATHER_API_KEY: 'TU_API_KEY'
};
```

2) Asegúrate de que `index.html` lo cargue antes del bootstrap (ya está configurado):

```html
<script src="assets/env.js"></script>
```

3) Alternativa (solo para pruebas): `src/environments/environment.ts` tiene un campo `openWeather.apiKey`. Evita subir claves reales.

---

## Uso y tips
- Estudiantes: crea/edita alumnos, agrega descripción e imagen (archivo o drag & drop). La imagen se guarda como Data URL en localStorage.
- Asistencia: selecciona fecha, marca estados y guarda; consulta “Últimos registros” para saltar rápidamente.
- Reporte: navega con el selector y los botones Anterior/Siguiente sobre fechas recientes.
- Clima: cambia la ciudad en el header; quedan guardadas las recientes para acceso rápido.

---

## Troubleshooting
- `npm start` falla
  - Ejecuta primero `npm install`.
  - Si persiste, borra `node_modules` y vuelve a instalar.
  - Revisa que `tsconfig.app.json` incluya `src/polyfills.ts` y que `zone.js` esté importado.

- No aparece el clima
  - Verifica que `assets/env.js` tenga `OPENWEATHER_API_KEY` válido.
  - Abre la consola: si hay 401 (API key inválida) o mensajes del widget, corrige la clave.
  - Prueba con una ciudad en formato `Ciudad,PAIS` (ej. `Santiago,CL`).

- “Ciudad no encontrada”
  - El servicio normaliza acentos y países; intenta `Viña del Mar,CL` o `Valparaiso,CL`.

- Fechas sin registro
  - El Reporte avisa cuando no hay datos; guarda asistencia en esa fecha desde la página de Asistencia.

---

## Licencia
Uso académico/educativo. Ajusta según tu necesidad.
