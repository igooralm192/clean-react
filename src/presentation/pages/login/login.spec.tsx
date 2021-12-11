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
import { Login } from '@/presentation/pages'
import { InvalidCredentialsError } from '@/domain/errors'

type SutTypes = {
  sut: RenderResult
  validationStub: ValidationStub
  authenticationSpy: AuthenticationSpy
};

type SutParams = {
  validationError: string
};

const history = createMemoryHistory({ initialEntries: ['/login'] })

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

const simulateValidSubmit = async (
  screen: RenderResult,
  email = faker.internet.email(),
  password = faker.internet.password()
): Promise<void> => {
  populateEmailField(screen, email)
  populatePasswordField(screen, password)

  const submitButton = screen.getByTestId('submit') as HTMLButtonElement
  fireEvent.click(submitButton)

  const form = screen.getByTestId('form')
  await waitFor(() => form)
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

const testStatusForField = (
  screen: RenderResult,
  fieldName: string,
  validationError?: string
): void => {
  const emailStatus = screen.getByTestId(`${fieldName}-status`)
  expect(emailStatus.title).toBe(validationError || 'Tudo certo!')
  expect(emailStatus.textContent).toBe(validationError ? '🔴' : '🟢')
}

const testErrorWrapChildCount = (
  screen: RenderResult,
  count: number
): void => {
  const errorWrap = screen.getByTestId('error-wrap')
  expect(errorWrap.childElementCount).toBe(count)
}

const testElementExists = (
  screen: RenderResult,
  testID: string
): void => {
  const element = screen.getByTestId(testID)
  expect(element).toBeTruthy()
}

const testElementText = (
  screen: RenderResult,
  testID: string,
  text: string
): void => {
  const element = screen.getByTestId(testID)
  expect(element.textContent).toBe(text)
}

const testButtonIsDisabled = (
  screen: RenderResult,
  testID: string,
  value: boolean
): void => {
  const button = screen.getByTestId(testID) as HTMLButtonElement
  expect(button.disabled).toBe(value)
}

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(cleanup)

  test('Should start with initial state', () => {
    const validationError = faker.random.words()
    const { sut: screen } = makeSut({ validationError })

    testErrorWrapChildCount(screen, 0)

    testButtonIsDisabled(screen, 'submit', true)

    testStatusForField(screen, 'email', validationError)
    testStatusForField(screen, 'password', validationError)
  })

  test('Should show email error if Validation fails', () => {
    const validationError = faker.random.words()
    const { sut: screen } = makeSut({ validationError })

    populateEmailField(screen)

    testStatusForField(screen, 'email', validationError)
  })

  test('Should show password error if Validation fails', () => {
    const validationError = faker.random.words()
    const { sut: screen } = makeSut({ validationError })

    populatePasswordField(screen)

    testStatusForField(screen, 'password', validationError)
  })

  test('Should show valid email state if Validation succeeds', () => {
    const { sut: screen } = makeSut()

    populateEmailField(screen)

    testStatusForField(screen, 'email')
  })

  test('Should show valid password state if Validation succeeds', () => {
    const { sut: screen } = makeSut()

    populatePasswordField(screen)

    testStatusForField(screen, 'password')
  })

  test('Should enable submit button if form is valid', () => {
    const { sut: screen } = makeSut()

    populateEmailField(screen)
    populatePasswordField(screen)

    testButtonIsDisabled(screen, 'submit', false)
  })

  test('Should show spinner on submit', async () => {
    const { sut: screen } = makeSut()

    await simulateValidSubmit(screen)

    testElementExists(screen, 'spinner')
  })

  test('Should call Authentication with correct values', async () => {
    const { sut: screen, authenticationSpy } = makeSut()

    const email = faker.internet.email()
    const password = faker.internet.password()

    await simulateValidSubmit(screen, email, password)

    expect(authenticationSpy.params).toEqual({ email, password })
  })

  test('Should call Authentication only once', async () => {
    const { sut: screen, authenticationSpy } = makeSut()

    await simulateValidSubmit(screen)
    await simulateValidSubmit(screen)

    expect(authenticationSpy.callsCount).toBe(1)
  })

  test('Should not call Authentication if form is invalid', async () => {
    const validationError = faker.random.words()
    const { sut: screen, authenticationSpy } = makeSut({ validationError })

    await simulateValidSubmit(screen)

    expect(authenticationSpy.callsCount).toBe(0)
  })

  test('Should present error if Authentication fails', async () => {
    const { sut: screen, authenticationSpy } = makeSut()

    const error = new InvalidCredentialsError()

    jest
      .spyOn(authenticationSpy, 'auth')
      .mockReturnValueOnce(Promise.reject(error))

    await simulateValidSubmit(screen)

    testErrorWrapChildCount(screen, 1)
    testElementText(screen, 'main-error', error.message)
  })

  test('Should add accessToken to localStorage on success', async () => {
    const { sut: screen, authenticationSpy } = makeSut()

    await simulateValidSubmit(screen)

    await waitFor(() =>
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        authenticationSpy.account.accessToken
      )
    )

    expect(history.length).toBe(1)
    expect(history.location.pathname).toBe('/')
  })

  test('Should go to signup page', () => {
    const { sut: screen } = makeSut()

    const register = screen.getByTestId('signup')
    fireEvent.click(register)

    expect(history.length).toBe(2)
    expect(history.location.pathname).toBe('/signup')
  })
})
