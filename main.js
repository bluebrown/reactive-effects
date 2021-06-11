'use strict'

import {reactive, createApp, createEffect, html} from './proxy.js'


// track how many times render is actually called
// for testing purposes
let renderCounter = 0

// return reactive proxy from this setup function
createApp({
  setup() {

    // create proxy object
    const state = reactive({ a: 1, b: 2, deep: { a: 5 } })

    // create some test effects as well
    createEffect(() => {
      console.log('watch a', state.a)
    })

    createEffect(() => {
      console.log('watch b', state.b)
    })

    createEffect(() => {
      console.log('watch deep a', state.deep.a)
    })

    // return the state
    return state
  }
  // mount the app which binds the proxy object
  // as this to the template function and creates
  // a render effect
}).mount(function template() {
  renderCounter++
  return html`
    <section class="container p-5 has-background-white-ter h-screen">
      <div class="box">
        <code>Render Count: ${renderCounter}</code>
        <button class="button" @click="${() => this.a++}">${this.a}</button>
        <button class="button" @click="${() => this.b++}">${this.b}</button>
        <button class="button" @click="${() => this.deep.a++}">${this.deep.a}</button>
        <button class="button" @click="${() => {
          this.a++
          this.b++
          this.b++
          this.deep.a++
          this.deep.a++
          this.deep.a++
        }}">${Math.round(this.a*this.b/this.deep.a) || 0}</button>
        <button class="button" @click="${()=> {
          this.a = 0
          this.b = 0
          this.deep.a = 0
        }}">Reset</button>

      </div>
    </section>
    `
}, document.getElementById('app'))
