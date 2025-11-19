export interface CreateSessionOptions {
  title: string;
  durationMinutes?: number;
}

export async function runCreateSessionCommand(options: CreateSessionOptions): Promise<void> {
  // TODO: Replace this stub with a real HTTP call to the sessions creation endpoint,
  // including attaching an auth token from local storage.
  console.log('[stub] Creating study session with:');
  console.log(`  title: ${options.title}`);
  console.log(`  durationMinutes: ${options.durationMinutes ?? 'not specified'}`);

  const fakeSession = {
    sessionId: 'session_fake_456',
    title: options.title,
    durationMinutes: options.durationMinutes ?? null,
  };

  console.log('\nSession created (stub):');
  console.log(JSON.stringify(fakeSession, null, 2));
}

