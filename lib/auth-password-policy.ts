/** Matches email sign up rules: length, number, special character. */

export function validateStrongPassword(password: string): string | null {
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (!/[0-9]/.test(password)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character.";
  }
  return null;
}
