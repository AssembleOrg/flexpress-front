/*
 * DEPRECATED: Legacy chat page with hardcoded demo data and conflicting Message type
 *
 * This page has been deprecated because:
 * 1. Contains local type definition of Message that conflicts with official Message type from lib/types/api
 * 2. Uses hardcoded demo data and fake user information
 * 3. Has been replaced by the real matching and conversation system:
 *    - Client matching: /client/trips/matching/[matchId]
 *    - Driver dashboard with reactive conversation creation: /driver/dashboard
 *    - Chat window: /components/chat/ChatWindow.tsx
 *
 * To be fully removed in a future cleanup phase.
 */

export default function ChatNegotiationPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Página en construcción</h1>
      <p>
        Esta página ha sido reemplazada por el nuevo sistema de matching y
        conversaciones en tiempo real.
      </p>
      <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "1rem" }}>
        Por favor, utiliza:
      </p>
      <ul style={{ textAlign: "left", display: "inline-block" }}>
        <li>
          <strong>Cliente:</strong> /client/trips/matching/[matchId]
        </li>
        <li>
          <strong>Conductor:</strong> /driver/dashboard
        </li>
      </ul>
    </div>
  );
}
