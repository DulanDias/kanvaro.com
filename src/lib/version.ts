// Utility to expose the app version on the client

export function getAppVersion(): string {
  const explicitVersion = (process.env.NEXT_PUBLIC_APP_VERSION || '').trim()
  if (explicitVersion) return explicitVersion

  const commitSha = (process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || '').trim()
  if (commitSha) return `sha:${commitSha.slice(0, 7)}`

  return 'dev'
}


