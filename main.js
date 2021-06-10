function isObject(value) {
  return value !== null
     && typeof value === 'object'
}

// Maintain a stack of running effects
const runningEffects = []

// Maintain map of targets ad subscribers
const subscribedEffects = new Map()

// handle proxy trap callbacks
function track(target, prop, value) {
  let subs = subscribedEffects.get(target) || {}
  if (!subs[prop]) subs[prop] = new Set()
  for (const fn of runningEffects) {
    subs[prop].add(fn)
  }
  subscribedEffects.set(target, subs)
}

function trigger(target, prop, value) {
  let subs = subscribedEffects.get(target) || {}
  if (!subs[prop]) return
  for (const fn of subs[prop]) {
    fn()
  }
}

// handle object access
const handler = {
  get(target, prop) {
    const value = Reflect.get(...arguments)
    track(target, prop, value)
    return isObject(value)
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
function reactive(value) {
  return new Proxy(value, handler)
}


const createEffect = fn => {
  // Wrap the passed fn in an effect function
  const effect = () => {
    runningEffects.push(effect)
    fn()
    runningEffects.pop()
  }

  // Automatically run the effect immediately
  effect()
}


const state = reactive({a:1, b:2, deep: {a: 5}})

createEffect(() => {
  console.log(state.deep.a)
})

createEffect(() => {
  console.log(state.a)
})

state.a++
state.a++

state.deep.a++