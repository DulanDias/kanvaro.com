export default function EnvDocs() {
  return (
    <div className="prose">
      <h1>Environment</h1>
      <h2>API (.env)</h2>
      <pre>
        <code>{`DATABASE_URL=postgresql://kanvaro:Kanvaro%402025@localhost:5432/kanvaro?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev-secret-key
SESSION_SECRET=dev-session-secret
FRONTEND_URL=http://localhost:3000
PORT=3001
`}</code>
      </pre>
      <h2>Web (.env.local)</h2>
      <pre>
        <code>{`NEXT_PUBLIC_API_URL=http://localhost:3001
`}</code>
      </pre>
    </div>
  );
}
