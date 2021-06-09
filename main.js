'use strict'
import { createApp, html } from './lib.js'
import { testApp, app } from './components.js'

createApp(app).mount(document.getElementById('app'))