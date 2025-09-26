import { createSyntheticEmail } from './utils'

describe('createSyntheticEmail', () => {
  it('should create a synthetic email from a valid cedula', () => {
    const cedula = '123456789'
    const expectedEmail = '123456789@auth.autoridadpolitica.app'
    expect(createSyntheticEmail(cedula)).toBe(expectedEmail)
  })

  it('should trim whitespace from the cedula before creating the email', () => {
    const cedula = '  987654321  '
    const expectedEmail = '987654321@auth.autoridadpolitica.app'
    expect(createSyntheticEmail(cedula)).toBe(expectedEmail)
  })

  it('should return null if the cedula is null or undefined', () => {
    expect(createSyntheticEmail(null)).toBeNull()
    expect(createSyntheticEmail(undefined)).toBeNull()
  })

  it('should return null if the cedula is not a string', () => {
    expect(createSyntheticEmail(12345)).toBeNull()
    expect(createSyntheticEmail({})).toBeNull()
    expect(createSyntheticEmail([])).toBeNull()
  })
})