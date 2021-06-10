'use strict'

import { render } from 'https://unpkg.com/lit-html@1.4.1/lit-html.js'
export { html } from 'https://unpkg.com/lit-html@1.4.1/lit-html.js'

function isO(value) {
  return value !== null
    && typeof value === 'object'
}

function isA(value) {
  return Array.isArray(value)
}

const runningEffects = []
const targets = new Map()

function track(target, prop) {
  const subscribedEffects = targets.get(target) || {} 
  
  if (!subscribedEffects[prop]) {
    subscribedEffects[prop] = new Set()
  }

  for (const effect of runningEffects) {
    subscribedEffects[prop].add(effect)
  }

  targets.set(target, subscribedEffects)

}

let draw = null
function trigger(target, prop) {
  const subscribedEffects = targets.get(target) || {}
  if (!subscribedEffects[prop]) return
  
  clearTimeout(draw)
  draw = setTimeout(() => {
    for (const effect of subscribedEffects[prop]) {
      effect()
    }
  }, 0)

}

const handler = {
  get(target, prop) {
    const value = Reflect.get(...arguments)
    if (isO(value)) {
      return reactive(value)
    } else {
      track(target, prop, value)
      return value
    }
  },
  set(target, prop) {
    const ok = Reflect.set(...arguments)
    trigger(target, prop, ok)
    return ok
  }
}

export function reactive(data) {
  return new Proxy(data, handler)
}

export const createEffect = fn => {
  const effect = async () => {
    runningEffects.push(effect)
    await fn()
    runningEffects.pop()
  }
  effect().catch(console.warn)
}

export function createApp(options) {
  const proxy = options.setup()
  function mount(template, context) {
    createEffect(() => {
      render(template.call(proxy), context)
    })
  }

  return {
    mount
  }
}
