// The privacy policy (spec T-077): the words only. The build turns them into
// /privacy.html (build/privacyPage.ts), so app stores and people can read it
// signed out.

/** Change this date whenever the words below change. */
export const UPDATED = '18 October 2026'

/** An email people can write to. Empty until DK picks one; the page then
 * points to "Ask for a change" only. */
export const CONTACT_EMAIL = ''

export interface Section {
  heading: string
  /** Each item is one paragraph; a list item starts with "- ". */
  lines: string[]
}

export const SECTIONS: Section[] = [
  {
    heading: 'Who we are',
    lines: [
      'Track Me Fit is a free diet and workout app for India.',
      'This page says what we keep about you, and why.',
      'It also says who can see it, and how to remove it.',
    ],
  },
  {
    heading: 'What we keep',
    lines: [
      '- Your account: name, email, and phone if you add it.',
      '- Your details: birth date, height, sex, goal and food habits.',
      '- What you log: food, weight, body size, workouts and check-ins.',
      '- Progress photos and coach certificates you add.',
      '- Messages between you and your coach.',
      '- Requests you send us, and our answers.',
      'Your weight, food and photos are health data. We treat them with extra care.',
    ],
  },
  {
    heading: 'Why we keep it',
    lines: [
      'We use it only to run the app for you.',
      'For example, to show your log and work out your targets.',
      'We do not sell your data. We do not show ads.',
      'We do not share it with other companies for their own use.',
    ],
  },
  {
    heading: 'Who can see it',
    lines: [
      '- You.',
      '- Your coach, only while you are linked to them.',
      '- Our support team, to fix a problem you tell us about.',
      'You can end a coach link at any time.',
      'Support may sign in as you to see the problem.',
      'Each time is saved in a log with the reason.',
      'Photos are private. Only you and your coach can open them.',
    ],
  },
  {
    heading: 'Where it is kept',
    lines: [
      'Your data is kept with Supabase, in their Mumbai data centre.',
      'The app itself is served by Vercel.',
      'With Google sign-in, Google gives us your name and email.',
      'Data goes over a safe, locked connection.',
    ],
  },
  {
    heading: 'Your rights',
    lines: [
      'Open Account in the app to use these rights.',
      '- Download my data: get one file with all of it.',
      '- Ask for a change: tell us what is wrong. We answer within 90 days.',
      '- Delete my account: this removes your account, data and photos.',
      'You can also fix most things yourself in the app.',
    ],
  },
  {
    heading: 'How long we keep it',
    lines: [
      'We keep your data until you delete your account.',
      'Then it is removed at once, with your photos.',
      'Our admin log keeps that we deleted an account, and why.',
    ],
  },
  {
    heading: 'Age',
    lines: ['Track Me Fit is for people aged 18 and over.'],
  },
  {
    heading: 'Changes to this page',
    lines: ['If we change this page, we change the date at the top.'],
  },
]

/** How to reach us, with the email once there is one. */
export function contactLines(email = CONTACT_EMAIL): string[] {
  return [
    'Use "Ask for a change" on the Account page in the app.',
    ...(email ? [`Or email us at ${email}.`] : []),
    'We answer within 90 days, as India\'s data law asks.',
  ]
}
