import faker from 'faker'
import { InvalidFieldError } from '@/validation/errors'
import { MinLengthValidation } from './min-length-validation'

const makeSut = (minLength: number) => new MinLengthValidation(faker.database.column(), minLength)

describe('MinLengthValidation', () => {
  test('Should return error if value is empty', () => {
    const minLength = faker.datatype.number()
    const sut = makeSut(minLength)
    const error = sut.validate(faker.datatype.string(minLength - 1))
    expect(error).toEqual(new InvalidFieldError())
  })

  test('Should return falsy if value is valid', () => {
    const minLength = faker.datatype.number()
    const sut = makeSut(minLength)
    const error = sut.validate(faker.datatype.string(minLength))
    expect(error).toBeFalsy()
  })
})
