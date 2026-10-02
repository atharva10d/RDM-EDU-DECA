export function challengeLoadFailureMessage(err: {
  status?: number;
  message?: string;
} | null | undefined): string {
  if (err?.status === 401) {
    return "Could not reach the challenge server. Retry, or stay signed in and try again.";
  }
  const message = err?.message?.trim();
  if (message && message.toLowerCase() !== "unauthorized") {
    return message;
  }
  return "Failed to load questions. Please check your connection.";
}
