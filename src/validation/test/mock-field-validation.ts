import { FieldValidation } from '@/validation/protocols'

export class FieldValidationSpy implements FieldValidation {
  error: Error = null

  constructor (readonly name: string) {}

  validate (value: string): Error {
    return this.error
  }
}
