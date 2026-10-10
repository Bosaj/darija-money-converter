import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('dmc:lang', JSON.stringify('en'))
  window.history.replaceState(null, '', '/')
})

describe('App', () => {
  it('converts the default phrase to Dirham', () => {
    render(<App />)
    expect(screen.getByRole('textbox')).toHaveValue('عشرين ألف ريال')
    expect(screen.getAllByText('1,000').length).toBeGreaterThan(0)
  })

  it('reads ?q= from the URL and converts as you type', async () => {
    window.history.replaceState(null, '', '/?q=' + encodeURIComponent('jouj dlmelyoun'))
    render(<App />)
    expect(screen.getAllByText('20,000').length).toBeGreaterThan(0)

    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, '75 dh w nss')
    expect(screen.getAllByText('75.50').length).toBeGreaterThan(0)
  })

  it('explains when it cannot understand the input', async () => {
    render(<App />)
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'salam')
    expect(screen.getByRole('status')).toHaveTextContent(/Didn’t get that/)
  })

  it('switches to Arabic and flips the page to RTL', async () => {
    render(<App />)
    const langs = screen.getByRole('radiogroup', { name: 'Language' })
    await userEvent.click(within(langs).getByRole('radio', { name: 'ع' }))
    expect(document.documentElement.dir).toBe('rtl')
    expect(screen.getByText('قولها بحال ولد البلاد')).toBeInTheDocument()
  })

  it('flags doro outside regions that define it', async () => {
    render(<App />)
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, '100 doro')
    expect(screen.getByRole('status')).toHaveTextContent(/no fixed value in this region/)
  })
})
