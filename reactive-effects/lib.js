'use strict'

// Maintain a stack of running effects
const runningEffects = []

// Maintain map of targets and subscribers
const subscribedEffects = new WeakMap()

// Maintain a set of effects that should 
// get run on the next tick
const scheduledEffects = new Set()

// put the effect on the stack while running
// so that the proxy knows which effect
// has used the getter/setter
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

// Handle tracked getter access
function track(target, prop, value) {
  let subs = subscribedEffects.get(target) || {}
  if (!subs[prop]) subs[prop] = new Set()
  runningEffects.forEach(fn => subs[prop].add(fn))
  subscribedEffects.set(target, subs)
}

// handle tracked setter access
function trigger(target, prop, value) {
  let subs = subscribedEffects.get(target) || {}
  if (!subs[prop]) return
  // Debounce effects until next tick
  subs[prop].forEach(fn => scheduledEffects.add(fn))
  setTimeout(() => {
    // run scheduled effects on the next tick
    scheduledEffects.forEach(fn => fn())
    // and clear the set afterwards
    scheduledEffects.clear()
  }, 0)
}

// Handle object access
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

// Create reactive proxy object
export function reactive(value) {
  return new Proxy(value, handler)
}

// Create reactive reference
export function ref(value) {
  return reactive({ value })
}

export function toRefs(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [key, ref(val)])
  )
}
