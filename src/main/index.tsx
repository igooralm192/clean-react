import React from 'react'
import ReactDOM from 'react-dom'
import Router from '@/presentation/router'
import { makeLogin } from '@/main/factories/pages/login/login-factory'

import '@/presentation/styles/global.scss'

ReactDOM.render(<Router makeLogin={makeLogin} />, document.getElementById('main'))
