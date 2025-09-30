export default function InstallDocs() {
  return (
    <div className="prose">
      <h1>Installation</h1>
      <p>
        Kanvaro uses a monorepo with Next.js (web/landing) and NestJS (API).
        You'll need Node.js 18+ and npm 9+.
      </p>
      <h2>Clone and bootstrap</h2>
      <pre>
        <code>{`git clone https://github.com/kanvaro/kanvaro
cd kanvaro
npm install
`}</code>
      </pre>
      <h2>Workspace apps</h2>
      <ul>
        <li>
          <code>apps/web</code>: App Router Next.js UI
        </li>
        <li>
          <code>apps/api</code>: NestJS API + Prisma
        </li>
        <li>
          <code>apps/landing</code>: Marketing site for kanvaro.com
        </li>
      </ul>
    </div>
  );
}
