'use strict'

import { html } from './lib.js'

export const ctxControl = (ctx) => html`
<nav class="navbar card ">
  <button class="button is-success" @click="${() => ctx.resume()}">Play</button>
  <button class="button" @click="${() => ctx.suspend()}">Pause</button>
</nav>
`;


export const testApp = {
  get template() {
    return html`
        <section class="container p-5 has-text-centered">
          <h1 class="title">${this.title}</h1>
          <button class="button is-primary" @click=${() => this.count++}
            >
            You clicked ${this.count} times!
          </button>
          <hr>
          <ul>
            ${this.todos.map(({ id, title, variant }) => html`
            <li class="mb-2">
              <span class="tag is-${variant} is-light">
                ${title}
                <button class="delete is-small" @click="${() => this.filterTodos(id)}"></button>
              </span>
            </li>
            `)}
          </ul>
        </section>`
  },
  data() {
    return {
      count: 0,
      title: 'Wue',
      todos: [],
      variants: [
        'black',
        'white',
        'primary',
        'link',
        'info',
        'success',
        'warning',
        'danger'
      ]
    }
  },
  created() {
    this.fetchTodos(10)
  },
  methods: {
    fetchTodos(amount = 5) {
      fetch('https://jsonplaceholder.typicode.com/todos?_limit=' + amount)
        .then(bytes => bytes.json())
        .then(json => {
          this.todos = json.map(todo => {
            todo.variant = this.randomItem(this.variants)
            return todo
          })
        }).catch(console.warn)
    },
    filterTodos(id) {
      this.todos = this.todos
        .filter(todo => todo.id !== id)
    },
    randomItem(items) {
      return items[Math.floor(Math.random() * items.length)]
    }
  },
  watch: {
    todos(newVal, oldVal) {
      if (newVal.length < 1) {
        this.fetchTodos()
      }
    }
  },
}


export const app = {
  get template() {
    return html`
      <section class="container p-5 has-text-centered" style="min-height: 100vh">
        ${ctxControl(this.ctx)}
        <br>
        ${Object.entries(this.nodes).map(([label, node]) => html`
        <article class="box">
          <h1 class="title is-size-4">${label}</h1>
          <div class="level">
            <div class="level-item">
              <h2>Inputs</h2>
              ${this.inputs(node).map(n => html`
              <button @click="${() => this.nodeClicked(node, 'input', n)}" class="button">${n}</button>
              `)}
            </div>
            <div class="level-item">
              <h2>Outputs</h2>
              ${this.outputs(node).map(n => html`
              <button @click="${() => this.nodeClicked(node, 'output', n)}" class="button">${n}</button>
              `)}
            </div>
          </div>
        </article>
        `)}
      </section>`
  },
  data() {
    const ctx = new AudioContext()
    const osc = new OscillatorNode(ctx)
    osc.start()
    return {
      ctx: ctx,
      currentOutput: null,
      nodes: {
        oscillator: osc,
        gain: new GainNode(ctx),
        destination: ctx.destination,
      }
    }
  },
  mounted() {
    document
      .querySelector('.container')
      .classList
      .add('has-background-dark')
  },
  methods: {
    nodeClicked(node, type, index) {
      if (this.currentOutput === null) {
        this.currentOutput = node
        return
      }
      this.currentOutput.connect(node)
      console.log('nodes, connected', this.currentOutput, node)
      this.currentOutput = null
    },
    inputs(node) {
      return Array.from({ length: node.numberOfInputs }, (_, i) => i)
    },
    outputs(node) {
      return Array.from({ length: node.numberOfOutputs }, (_, i) => i)
    }
  },
  watch: {
    currentOutput() {
      console.log('watcher fired')
    }
  }
}