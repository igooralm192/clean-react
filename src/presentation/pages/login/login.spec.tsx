import 'jest-localstorage-mock'
import faker from 'faker'
import { createMemoryHistory } from 'history'
import React from 'react'
import { Router } from 'react-router-dom'
import {
  render,
  RenderResult,
  fireEvent,
  cleanup,
  waitFor
} from '@testing-library/react'

import { AuthenticationSpy, ValidationStub } from '@/presentation/test'
import Login from './login'
import { InvalidCredentialsError } from '@/domain/errors'

type SutTypes = {
  sut: RenderResult
  validationStub: ValidationStub
  authenticationSpy: AuthenticationSpy
};

type SutParams = {
  validationError: string
};

const history = createMemoryHistory()

const makeSut = (params?: SutParams): SutTypes => {
  const validationStub = new ValidationStub()
  validationStub.errorMessage = params?.validationError

  const authenticationSpy = new AuthenticationSpy()

  const sut = render(
    <Router history={history}>
      <Login validation={validationStub} authentication={authenticationSpy} />
    </Router>
  )

  return {
    sut,
    validationStub,
    authenticationSpy
  }
}

const simulateValidSubmit = (
  screen: RenderResult,
  email = faker.internet.email(),
  password = faker.internet.password()
): void => {
  populateEmailField(screen, email)
  populatePasswordField(screen, password)

  const submitButton = screen.getByTestId('submit') as HTMLButtonElement
  fireEvent.click(submitButton)
}

const populateEmailField = (
  screen: RenderResult,
  email = faker.internet.email()
): void => {
  const emailInput = screen.getByTestId('email')
  fireEvent.input(emailInput, { target: { value: email } })
}

const populatePasswordField = (
  screen: RenderResult,
  password = faker.internet.password()
): void => {
  const emailInput = screen.getByTestId('password')
  fireEvent.input(emailInput, { target: { value: password } })
}

const simulateStatusForField = (
  screen: RenderResult,
  fieldName: string,
  validationError?: string
): void => {
  const emailStatus = screen.getByTestId(`${fieldName}-status`)
  expect(emailStatus.title).toBe(validationError || 'Tudo certo!')
  expect(emailStatus.textContent).toBe(validationError ? '🔴' : '🟢')
}

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(cleanup)

  test('Should start with initial state', () => {
    const validationError = faker.random.words()
    const { sut: screen } = makeSut({ validationError })

    const errorWrap = screen.getByTestId('error-wrap')
    expect(errorWrap.childElementCount).toBe(0)

    const submitButton = screen.getByTestId('submit') as HTMLButtonElement
    expect(submitButton.disabled).toBe(true)

    simulateStatusForField(screen, 'email', validationError)
    simulateStatusForField(screen, 'password', validationError)
  })

  test('Should show email error if Validation fails', () => {
    const validationError = faker.random.words()
    const { sut: screen } = makeSut({ validationError })

    populateEmailField(screen)

    simulateStatusForField(screen, 'email', validationError)
  })

  test('Should show password error if Validation fails', () => {
    const validationError = faker.random.words()
    const { sut: screen } = makeSut({ validationError })

    populatePasswordField(screen)

    simulateStatusForField(screen, 'password', validationError)
  })

  test('Should show valid email state if Validation succeeds', () => {
    const { sut: screen } = makeSut()

    populateEmailField(screen)

    simulateStatusForField(screen, 'email')
  })

  test('Should show valid password state if Validation succeeds', () => {
    const { sut: screen } = makeSut()

    populatePasswordField(screen)

    simulateStatusForField(screen, 'password')
  })

  test('Should enable submit button if form is valid', () => {
    const { sut: screen } = makeSut()

    populateEmailField(screen)
    populatePasswordField(screen)

    const submitButton = screen.getByTestId('submit') as HTMLButtonElement
    expect(submitButton.disabled).toBe(false)
  })

  test('Should show spinner on submit', () => {
    const { sut: screen } = makeSut()

    simulateValidSubmit(screen)

    const spinner = screen.getByTestId('spinner')
    expect(spinner).toBeTruthy()
  })

  test('Should call Authentication with correct values', () => {
    const { sut: screen, authenticationSpy } = makeSut()

    const email = faker.internet.email()
    const password = faker.internet.password()

    simulateValidSubmit(screen, email, password)

    expect(authenticationSpy.params).toEqual({ email, password })
  })

  test('Should call Authentication only once', () => {
    const { sut: screen, authenticationSpy } = makeSut()

    simulateValidSubmit(screen)
    simulateValidSubmit(screen)

    expect(authenticationSpy.callsCount).toBe(1)
  })

  test('Should not call Authentication if form is invalid', () => {
    const validationError = faker.random.words()
    const { sut: screen, authenticationSpy } = makeSut({ validationError })

    populateEmailField(screen)
    fireEvent.submit(screen.getByTestId('form'))

    expect(authenticationSpy.callsCount).toBe(0)
  })

  test('Should present error if Authentication fails', async () => {
    const { sut: screen, authenticationSpy } = makeSut()

    const error = new InvalidCredentialsError()

    jest
      .spyOn(authenticationSpy, 'auth')
      .mockReturnValueOnce(Promise.reject(error))

    simulateValidSubmit(screen)

    const errorWrap = screen.getByTestId('error-wrap')
    await waitFor(() => errorWrap)

    expect(errorWrap.childElementCount).toBe(1)

    const mainError = screen.getByTestId('main-error')
    expect(mainError.textContent).toBe(error.message)
  })

  test('Should add accessToken to localStorage on success', async () => {
    const { sut: screen, authenticationSpy } = makeSut()

    simulateValidSubmit(screen)

    await waitFor(() =>
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        authenticationSpy.account.accessToken
      )
    )
  })

  test('Should go to signup page', () => {
    const { sut: screen } = makeSut()

    const register = screen.getByTestId('signup')
    fireEvent.click(register)

    expect(history.length).toBe(2)
    expect(history.location.pathname).toBe('/signup')
  })
})
