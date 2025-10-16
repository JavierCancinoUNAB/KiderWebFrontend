# Kinder Web (Angular)

Aplicación de asistencia para Kinder con Angular 18 (standalone + signals). Incluye consumo de API externa (OpenWeather) para mostrar clima actual y pronóstico.

## Requisitos previos
- Node 18+
- API Key de OpenWeather: https://openweathermap.org/api

## Configuración rápida
1. Copia tu API key en `src/environments/environment.ts`:
	 ```ts
	 export const environment = {
		 production: false,
		 openWeather: {
			 baseUrl: 'https://api.openweathermap.org/data/2.5',
			 apiKey: 'TU_API_KEY',
			 defaultCity: 'Santiago,CL',
			 cacheMinutes: 15
		 }
	 };
	 ```
2. Instala dependencias y levanta el servidor:
	 ```bash
	 npm install
	 npm start
	 ```

## API externa (OpenWeather) – Explicación técnica
**Autenticación:** API key vía query param `appid`. Se gestiona por variables de entorno de Angular.

**Endpoints usados:**
- Current Weather: `GET /data/2.5/weather` con `q` o `lat,lon`, `units=metric`, `lang=es`, `appid=API_KEY`.
- Forecast (5d/3h): `GET /data/2.5/forecast` con `lat,lon`, `units=metric`, `lang=es`, `appid=API_KEY`.
- Geocoding: `GET /geo/1.0/direct` con `q`, `limit`, `appid=API_KEY`.

**Ejemplo de request:**
```
GET https://api.openweathermap.org/data/2.5/weather?q=Santiago,CL&units=metric&lang=es&appid=API_KEY
```

**Ejemplo de respuesta (fragmento):**
```json
{"name":"Santiago","weather":[{"description":"nubes dispersas","icon":"03d"}],"main":{"temp":19.7,"feels_like":19.3,"humidity":58}}
```

**Manejo de errores/carga/datos vacíos:**
- Loading: spinner/mensaje “Obteniendo clima…”.
- 401: API key inválida → mensaje y revisar `environment`.
- 404: ciudad no encontrada → mensaje y sugerir formato `Ciudad,PAIS`.
- 429: límite superado → caché (TTL 15 min) y reintento luego.
- Sin datos: ocultar widget y mostrar aviso.

**CORS y límites:** CORS habilitado; en caso de desarrollo puede usarse proxy de Angular. Limitar llamadas con caché.

**Aporte UX:** El clima y pronóstico aparecen en Asistencia, ayudando a planificar y entender variaciones de asistencia.

## Arquitectura/Buenas prácticas
- Angular standalone components + signals.
- Servicios dedicados (`AttendanceService`, `WeatherService`, `CityService`).
- Variables de entorno en `src/environments`.
- Componente compartido `WeatherWidgetComponent`.
- Estilos globales + Bootstrap 5.

## Scripts
- `npm start`: `ng serve`
- `npm build`: `ng build`

# KiderWebFrontend