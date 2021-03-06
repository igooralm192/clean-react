import React, { useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'

import { Authentication } from '@/domain/usecases'
import { LoginHeader as Header, Footer, Input, FormStatus } from '@/presentation/components'
import Context from '@/presentation/contexts/form/form-context'
import { Validation } from '@/presentation/protocols/validation'

import Styles from './login-styles.scss'

type Props = {
  validation: Validation
  authentication: Authentication
}

const Login: React.FC<Props> = ({ validation, authentication }) => {
  const history = useHistory()

  const [state, setState] = useState({
    isLoading: false,
    email: '',
    password: '',
    emailError: '',
    passwordError: '',
    mainError: ''
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    try {
      if (state.isLoading || state.emailError || state.passwordError) {
        return
      }

      setState({ ...state, isLoading: true })

      const account = await authentication.auth({ email: state.email, password: state.password })

      localStorage.setItem('accessToken', account.accessToken)

      history.replace('/')
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        mainError: error.message
      })
    }
  }

  useEffect(() => {
    setState({
      ...state,
      emailError: validation.validate('email', state.email),
      passwordError: validation.validate('password', state.password)
    })
  }, [state.email, state.password])

  return (
    <div className={Styles.login} >
      <Header/>

      <Context.Provider value={{ state, setState }}>
        <form className={Styles.form} onSubmit={handleSubmit} data-testid="form">
          <h2>Login</h2>

          <Input type="email" name="email" placeholder="Digite seu e-mail" />
          <Input type="password" name="password" placeholder="Digite sua senha" />

          <button
            type="submit"
            className={Styles.submit}
            disabled={!!state.emailError || !!state.passwordError}
            data-testid="submit"
          >
            Entrar
          </button>

          <Link className={Styles.link} to='/signup' data-testid="signup">Criar conta</Link>

          <FormStatus/>
        </form>
      </Context.Provider>

      <Footer/>
    </div>
  )
}

export default Login
