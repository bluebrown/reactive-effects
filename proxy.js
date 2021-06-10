'use strict'

import { render } from 'https://unpkg.com/lit-html@latest/lit-html.js'
export { html } from 'https://unpkg.com/lit-html@latest/lit-html.js'


// Maintain a stack of running effects
const runningEffects = []

// Maintain map of targets and subscribers
const subscribedEffects = new Map()

export const createEffect = fn => {
  // Wrap the passed fn in an effect function
  const effect = () => {
    runningEffects.push(effect)
    fn()
    runningEffects.pop()
  }

  // Automatically run the effect immediately
  effect()
}

// handle proxy trap callbacks
function track(target, prop, value) {
  let subs = subscribedEffects.get(target) || {}
  if (!subs[prop]) subs[prop] = new Set()
  for (const fn of runningEffects) {
    subs[prop].add(fn)
  }
  subscribedEffects.set(target, subs)
}

let nextTick = null
function trigger(target, prop, value) {
  let subs = subscribedEffects.get(target) || {}
  if (!subs[prop]) return
  // debounce update triggers until next tick
  clearTimeout(nextTick)
  nextTick = setTimeout(() => {
    for (const fn of subs[prop]) {
      fn()
    }
  }, 0)
}

// handle object access
const handler = {
  get(target, prop) {
    const value = Reflect.get(...arguments)
    track(target, prop, value)
    return value !== null && typeof value === 'object'
      ? reactive(value)
      : value;
  },
  set(target, prop) {
    const ok = Reflect.set(...arguments)
    trigger(target, prop, ok)
    return ok
  }
}

// create reactive proxy object
export function reactive(value) {
  return new Proxy(value, handler)
}


export function createApp(opts) {
  const proxy = opts.setup()
  return {
    mount: (template, context) => {
      createEffect(() => render(template.call(proxy), context))
    }
  }
}
