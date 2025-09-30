export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose">
      <h1>Privacy Policy</h1>
      <p>
        Kanvaro is an open-source project. If you deploy Kanvaro, you control
        your data entirely. We do not collect any personal data from your
        self-hosted instance.
      </p>
      <h2>Data Ownership</h2>
      <p>
        Your data remains in your infrastructure (AWS or self-hosted). Review
        and configure your logs and backups accordingly.
      </p>
      <h2>Cookies</h2>
      <p>
        If you run the web app, sessions are stored via httpOnly cookies in your
        domain as configured by you.
      </p>
    </div>
  );
}
