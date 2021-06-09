'use strict'
import { createApp } from './lib.js'
import { testApp, app } from './components.js'

createApp(testApp).mount(document.getElementById('app'))