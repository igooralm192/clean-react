import faker from 'faker'
import { InvalidFieldError } from '@/validation/errors'
import { MinLengthValidation } from './min-length-validation'

const makeSut = () => new MinLengthValidation(faker.database.column(), 5)

describe('MinLengthValidation', () => {
  test('Should return error if email is empty', () => {
    const sut = makeSut()
    const error = sut.validate('123')
    expect(error).toEqual(new InvalidFieldError())
  })

  // test('Should return falsy if email is valid', () => {
  //   const sut = makeSut()
  //   const error = sut.validate(faker.internet.email())
  //   expect(error).toBeFalsy()
  // })
})
