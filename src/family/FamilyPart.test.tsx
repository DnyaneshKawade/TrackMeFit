// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { FamilyPart } from './FamilyPart'
import { memoryFamilyStore } from './family'

afterEach(cleanup)

const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('one age rule (T-086)', () => {
  it('2. a parent types the code, sees what it means, says yes, and can take it back', async () => {
    const store = memoryFamilyStore({ child: 'Riya' })
    await store.newCode()
    render(<FamilyPart store={store} teen={false} />)
    fireEvent.change(await screen.findByLabelText('Your child’s code'), { target: { value: 'wrong' } })
    click('Next')
    expect((await screen.findByRole('alert')).textContent).toBe('This code doesn’t work. Ask for a new one.')
    fireEvent.change(screen.getByLabelText('Your child’s code'), { target: { value: 'abcd-1234' } })
    click('Next')
    expect(await screen.findByText('This code is from Riya. If you say yes, Riya can use Track Me Fit.')).toBeTruthy()
    expect(screen.getByText('Only Riya sees them. They can’t link to a coach until 18.')).toBeTruthy()
    click('Say yes for Riya')
    expect((await screen.findByRole('status')).textContent).toBe('You said yes for Riya.')
    expect(store.parentOk).toBe(true)

    click('Take back my yes for Riya')
    click('Yes, take it back')
    expect((await screen.findByRole('status')).textContent).toBe('You took back your yes for Riya.')
    expect(store.parentOk).toBe(false)
    expect(screen.queryByText(/You said yes for/)).toBeNull()
  })

  it('3. a teen sees which parent said yes', async () => {
    render(<FamilyPart store={memoryFamilyStore({ parent: 'Meena' })} teen />)
    expect((await screen.findByRole('region', { name: 'Your parent' })).textContent).toMatch(/Meena said yes on/)
  })
})
