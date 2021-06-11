'use strict'

import {createApp, createEffect, html} from './proxy.js'


// track how many times render is actually called
// for testing purposes
let renderCounter = 0

// return reactive proxy from this setup function
createApp({
  setup() {

    // create proxy object
    this.a = 1
    this.b = 2
    this.deep = {a: 3}
    this.c  = 0

    // create some test effects as well
    createEffect(() => {
      console.log('watch a', this.a)
    })

    createEffect(() => {
      console.log('watch b', this.b)
    })

    createEffect(() => {
      console.log('watch deep a', this.deep.a)
    })

    const foo = () => {
      this.a++
      console.log('foo called')
    }

    return {
      foo
    }

  }
  // mount the app which binds the proxy object
  // as this to the template function and creates
  // a render effect
}).mount(function template({foo}) {
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
        <button class="button" @click="${foo}">Reset</button>
      </div>
    </section>
    `
}, document.getElementById('app'))
