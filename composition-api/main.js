
'use strict'

import { html, render } from 'https://unpkg.com/lit-html@latest/lit-html.js'
import { createEffect, toRefs } from './lib.js'

// some template
let t = ({ i, a, b }) => html`
  <h1>Power of ${i}</h1>
  <button class="button" @click="${() => a.value++}">
    ${a.value}
  </button>
  =
  <code>${b.value}</code>
`

// create some test components in a loop
for (let i = 0; i < 10; i++) {
  // we need a container to render against
  let container = document.createElement('div')
  container.classList = 'box has-text-center'
  document.body.append(container)

  // reactive references
  let { a, b } = toRefs({ a: 0, b: 0 })

  // watch effect
  createEffect(() => console.log(a.value))

  // compute effect
  createEffect(() => {
    b.value = a.value ** i
  })

  // render effect
  createEffect(() => render(t({ i, a, b }), container))
}
