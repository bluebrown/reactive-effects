'use strict'

import { createApp, html } from './lib.js'

createApp({
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
  mounted() {
    let b = document.querySelector('button')
  },
  watch: {
    todos(newVal, oldVal) {
      if (newVal.length < 1) {
        this.fetchTodos()
      }
    }
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
}).mount(document.getElementById('app'))
