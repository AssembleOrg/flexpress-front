. Stack Principal

    Framework: Next.js (App Router)

    UI: Material-UI (MUI)

    Estado: React Query + Zustand

    API: Axios & Socket.IO Client

2. Gestión de Estado: React Query vs. Zustand

React Query es para ESTADO DE SERVIDOR.

    Qué es: Cualquier dato que vive en el backend (matches, viajes, usuarios). Es la fuente de la verdad para los datos de la API.

    Uso:

        useQuery para leer datos (GET).

        useMutation para escribir datos (POST, PUT, DELETE).

Zustand es para ESTADO DE CLIENTE.

    Qué es: Datos que viven solo en el navegador.

    Uso:

        Formularios: Datos de un campo de búsqueda antes de ser enviados.

        Estado de la UI: Controlar si un modal está abierto.

        Sesión de Usuario: El authStore para guardar el user y el token en localStorage.

3. Flujo de Datos de la API

El flujo desde el backend hasta la UI sigue 3 capas claras:

Componente (UI) ➡️ Hook de React Query ➡️ Capa de API ➡️ Backend

    Componente: Llama a un hook (ej: useUserMatches()) y renderiza la UI según los estados isLoading, isError, y data. Es "tonto".

    Hook de React Query: Maneja el cache, el fetching y la lógica de onSuccess/onError. Llama a la función de la Capa de API.

    Capa de API (lib/api/...): Su única responsabilidad es hacer la llamada axios y limpiar/transformar la respuesta del backend, extrayendo el payload útil (normalmente de response.data.data) y devolviendo datos seguros y predecibles.

4. Flujo Clave: Matchmaking (Cliente ↔ Chófer)

Este es el flujo más complejo y combina todo:

    Cliente crea match (useCreateMatch).

    Cliente selecciona chófer (useSelectCharter) -> La UI del cliente entra en modo "espera".

    Chófer recibe match en su dashboard (vía polling con useCharterMatches).

    Chófer acepta el match (useRespondToMatch).

    Un useEffect en el Dashboard del Chófer detecta el cambio de estado a 'accepted' y dispara la creación de la conversación (useCreateConversation).

    NOTA: Se necesita modificar el backend para notificar al Cliente vía WebSocket (match:updated).

    El Cliente recibe el evento, invalida su caché de React Query, y la UI se actualiza automáticamente para mostrar el chat.

5. Despliegue y Entornos

La configuración se gestiona con las siguientes variables de entorno. El código no necesita cambios entre entornos.
Local (.env.local)
code Code

    
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...

  

Producción (Vercel/Netlify)
code Code

    
NEXT_PUBLIC_API_URL=[backendurl]/api/v1
NEXT_PUBLIC_SOCKET_URL=[backendurl]
NEXT_PUBLIC_GOOGLE_MAPS_KEY=[google key]

  
Para que el WebSocket funcione en producción, la URL de tu frontend debe ser añadida a la lista de origin en la configuración CORS del WebSocketGateway del backend.
