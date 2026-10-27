export function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('rate limit') || m.includes('too many')) {
    return "Our email sender hit its hourly limit — totally a us problem, not you! Wait ~1 hour and try again, or ask the app owner to set up a custom email provider 😅";
  }
  if (m.includes('not authorized')) {
    return "We couldn't send that email. Baby Tinder's mail only reaches people on the Supabase project team until a real email service is connected. Ask the app owner to set that up, then try again.";
  }
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('wrong password')) {
    return "That email/password combo isn't ringing any bells. Double-check and try again!";
  }
  if (m.includes('already registered') || m.includes('already exists') || m.includes('user_already_exists')) {
    return "Looks like that email's taken. Try signing in instead!";
  }
  if (m.includes('email not confirmed')) {
    return "Almost there! Check your inbox and confirm your email first.";
  }
  if (
    m.includes('expired') ||
    m.includes('otp') ||
    m.includes('auth session missing') ||
    m.includes('session missing') ||
    (m.includes('invalid') && (m.includes('token') || m.includes('link') || m.includes('grant')))
  ) {
    return "That reset link has expired or was already used. Request a fresh one and try again.";
  }
  if (m.includes('network') || m.includes('fetch')) {
    return "Couldn't reach the server — check your connection and try again.";
  }
  if ((m.includes('same') && m.includes('password')) || m.includes('different from the old')) {
    return "That's the same as your current password. Pick a different one.";
  }
  if (m.includes('password') && (m.includes('short') || m.includes('at least') || m.includes('weak') || m.includes('pwned') || m.includes('leaked'))) {
    return "That password's a little shy. Make it at least 6 characters, and skip anything too common.";
  }
  if (m.includes('couple space is already full')) return "Oops — that partner space is already full! Each space is just for two 💑";
  if (m.includes('already a member')) return "You're already connected to this partner space!";
  if (m.includes('invalid invite') || m.includes('invalid code')) return "That invite code doesn't exist. Double-check the link and try again!";
  if (m.includes('row-level security') || m.includes('row level security') || m.includes('permission denied')) {
    return "The database blocked that save. If you were joining a partner, that space may already be full.";
  }
  if (m.includes('database error') || m.includes('duplicate key')) {
    return "Something in the database got in the way. Give it another go, or sign in if you already have an account.";
  }
  return "Something went sideways on our end. Give it another go!";
}
