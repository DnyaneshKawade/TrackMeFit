// The top of the app greets the person, like the design board (T-101d).

/** "Good morning" before 12, "Good afternoon" before 5 pm, then "Good evening". */
export function greeting(now: Date, name?: string): string {
  const h = now.getHours()
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const first = name?.trim().split(/\s+/)[0]
  return first ? `${part}, ${first}` : part
}

/** "Monday, 19 October". */
export function dayLine(now: Date): string {
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' })
  const month = now.toLocaleDateString('en-GB', { month: 'long' })
  return `${weekday}, ${now.getDate()} ${month}`
}

/** The first letter for the round picture, or "?" with no name. */
export function initial(nameOrEmail: string): string {
  return nameOrEmail.trim().charAt(0).toUpperCase() || '?'
}
