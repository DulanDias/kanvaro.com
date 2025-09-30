export default function SelfHostingDocs() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose">
      <h1>Self-host Kanvaro</h1>
      <p>
        Kanvaro is open source under the MIT license. You can run it locally or
        on your own infrastructure.
      </p>
      <h2>Requirements</h2>
      <ul>
        <li>Node.js 18+</li>
        <li>Docker + Docker Compose</li>
        <li>PostgreSQL 15+</li>
        <li>Redis 7+</li>
      </ul>
      <h2>Quickstart</h2>
      <pre>
        <code>
          {`git clone https://github.com/kanvaro/kanvaro
cd kanvaro
npm install
docker-compose up -d postgres redis
npm run dev`}
        </code>
      </pre>
      <h2>Environment</h2>
      <p>
        Create an <code>.env</code> in <code>apps/api</code> with your database
        and redis URLs.
      </p>
    </div>
  );
}
