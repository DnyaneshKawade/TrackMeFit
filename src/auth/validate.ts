// Form checks for sign-in. Each returns a message to show, or null when fine.

export function checkEmail(email: string): string | null {
  const e = email.trim()
  if (!e) return 'Enter your email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return 'That email doesn’t look right.'
  return null
}

export function checkPassword(password: string): string | null {
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'Use letters and at least one number.'
  return null
}

export function checkName(name: string): string | null {
  if (!name.trim()) return 'Enter your name.'
  if (name.trim().length > 60) return 'Keep your name under 60 characters.'
  return null
}
