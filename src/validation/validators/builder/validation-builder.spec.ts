import faker from 'faker'
import { EmailValidation, MinLengthValidation, RequiredFieldValidation } from '@/validation/validators'
import { ValidationBuilder as sut } from './validation-builder'

describe('ValidationBuilder', () => {
  test('Should return RequiredFieldValidation', () => {
    const field = faker.database.column()
    const validators = sut.field(field).required().build()

    expect(validators).toEqual([new RequiredFieldValidation(field)])
  })

  test('Should return EmailValidation', () => {
    const field = faker.database.column()
    const validators = sut.field(field).email().build()

    expect(validators).toEqual([new EmailValidation(field)])
  })

  test('Should return MinLengthValidation', () => {
    const field = faker.database.column()
    const length = faker.datatype.number()
    const validators = sut.field(field).min(length).build()

    expect(validators).toEqual([new MinLengthValidation(field, length)])
  })

  test('Should return a list of validators', () => {
    const field = faker.database.column()
    const length = faker.datatype.number()
    const validators = sut.field(field).required().min(length).email().build()

    expect(validators).toEqual([
      new RequiredFieldValidation(field),
      new MinLengthValidation(field, length),
      new EmailValidation(field)
    ])
  })
})
