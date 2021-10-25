import { FieldValidation } from '../../protocols'

export class RequiredFieldValidation implements FieldValidation {
  constructor (readonly name: string) {}

  validate (value: string): Error {
    return value ? null : new Error('Campo obrigatório')
  }
}
