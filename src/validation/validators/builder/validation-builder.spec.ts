import { EmailValidation, MinLengthValidation, RequiredFieldValidation } from '@/validation/validators'
import { ValidationBuilder as sut } from './validation-builder'

describe('ValidationBuilder', () => {
  test('Should return RequiredFieldValidation', () => {
    const validators = sut.field('any_field').required().build()

    expect(validators).toEqual([new RequiredFieldValidation('any_field')])
  })

  test('Should return EmailValidation', () => {
    const validators = sut.field('any_field').email().build()

    expect(validators).toEqual([new EmailValidation('any_field')])
  })

  test('Should return MinLengthValidation', () => {
    const validators = sut.field('any_field').min(5).build()

    expect(validators).toEqual([new MinLengthValidation('any_field', 5)])
  })
})
