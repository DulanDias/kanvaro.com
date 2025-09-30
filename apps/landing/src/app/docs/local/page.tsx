export default function LocalDocs() {
  return (
    <div className="prose">
      <h1>Local development</h1>
      <h2>Docker (recommended)</h2>
      <pre>
        <code>{`docker-compose up -d postgres redis
npm run dev
`}</code>
      </pre>
      <p>
        This runs Postgres and Redis in Docker, then starts web and api with
        Turbo.
      </p>
      <h2>Prisma</h2>
      <pre>
        <code>{`cd apps/api
npx prisma migrate dev
npx prisma studio
`}</code>
      </pre>
      <h2>Testing</h2>
      <pre>
        <code>{`npm run test
`}</code>
      </pre>
    </div>
  );
}
