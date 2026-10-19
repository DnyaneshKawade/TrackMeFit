// The public page on deleting an account (spec T-098): the words only. The
// build turns them into /delete-account.html, which app stores link to.

import { CONTACT_EMAIL, type Section } from './privacy'

export const DELETE_SECTIONS: Section[] = [
  {
    heading: 'Delete it in the app',
    lines: [
      '- Sign in to Track Me Fit.',
      '- Open Account at the top.',
      '- Go to "Delete my account" at the bottom.',
      '- Type DELETE and tap "Delete forever".',
      'It is done at once. You are signed out.',
    ],
  },
  {
    heading: 'What is removed',
    lines: [
      'Your account, details, food log, weight, workouts and photos.',
      'Your check-ins, messages and requests too.',
      'A coach link ends, and your coach no longer sees anything.',
      'We can’t bring any of it back.',
      'Our admin log keeps only that an account was deleted, and why.',
    ],
  },
  {
    heading: 'Can’t sign in?',
    lines: [
      `Email us at ${CONTACT_EMAIL} from the email you signed up with.`,
      'Write "Delete my account".',
      'We delete it and write back within 7 days.',
    ],
  },
]
