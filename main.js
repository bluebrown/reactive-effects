'use strict'

import {reactive, createApp, createEffect, html} from './proxy'


// track how many times render is actually called
let renderCounter = 0

createApp({
  setup() {

    const state = reactive({ a: 1, b: 2, deep: { a: 5 } })

    createEffect(() => {
      console.log('watch a', state.a)
    })

    createEffect(() => {
      console.log('watch b', state.b)
    })

    createEffect(() => {
      console.log('watch deep a', state.deep.a)
    })

    return state
  }
}).mount(function template() {
    renderCounter++
    return html`
      <code>Render Count: ${renderCounter}</code>
      <button class="button" @click="${() => this.a++}">${this.a}</button>
      <button class="button" @click="${() => this.b++}">${this.b}</button>
      <button class="button" @click="${() => this.deep.a++}">${this.deep.a}</button>
  `
}, document.body)
