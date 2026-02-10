# FaB League Tracker

Una aplicación web moderna para gestionar ligas y torneos de **Flesh and Blood TCG**.

## Características Principales

*   **Ranking de Jugadores:** Tabla de posiciones automática basada en victorias y puntos.
*   **Gestión de Torneos:** Crea torneos, registra resultados y actualiza estadísticas al instante.
*   **Perfiles de Jugador:** Historial detallado de partidas, héroes más usados y racha de victorias.
*   **"El Oráculo":** Un asistente de IA (potenciado por Gemini) que responde dudas sobre reglas y estrategias del juego.
*   **Autenticación Segura:** Sistema de Login y Registro para proteger los datos de la liga.
*   **Base de Datos en Tiempo Real:** Todos los cambios se sincronizan al instante entre todos los usuarios gracias a Firebase.

## Tecnologías

*   **Frontend:** React, TypeScript, Tailwind CSS, Vite.
*   **Backend/BaaS:** Firebase (Authentication & Firestore).
*   **IA:** Google Gemini API.

## Cómo ejecutar localmente

1.  Clonar el repositorio.
2.  Instalar dependencias: `npm install`
3.  Configurar variables de entorno en `.env`.
4.  Ejecutar: `npm run dev`
