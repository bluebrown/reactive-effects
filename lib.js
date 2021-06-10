'use strict'

import { render } from 'https://unpkg.com/lit-html@latest/lit-html.js'
export { html } from 'https://unpkg.com/lit-html@latest/lit-html.js'

const hookNames = [
  'beforeCreate',
  'beforeUpdate',
  'updated',
  'created',
  'mounted',
]

export function createApp(app) {

  // create shim object to store react properties and 
  // other context data
  const shim = {
    instance: {},
    render: () => { },
    mount: () => { },
  }

  // get app data
  const _data = app.data()

  // flags to know if app has context
  // and is mounted
  let mounted = false
  let context = false

  // extract the hooks from the app object
  const hooks = Object.fromEntries(
    hookNames
      .map(n => [n, app[n]])
      .filter(f => typeof f[1] === 'function')
  )

  // use to call life cycle hooks if any
  function invokeLifeCycleHook(hook) {
    // pass the current instance as `this`
    // in order to make the reactive properties available
    if (hook) hook.call(shim.instance)
  }

  // copy watchers
  const watchers = Object.assign({}, app.watch)

  // copy methods
  const methods = Object.assign({}, app.methods)

  // use to call watcher if any
  function invokeWatcher(prop, newVal, oldVal) {
    const watcher = watchers[prop]
    if (typeof watcher === 'function') {
      watcher.call(shim.instance, newVal, oldVal)
    }
  }

  // grab the template as long as its hot
  const template = Object.getOwnPropertyDescriptor(app, 'template').get

  // call this function whe data changes
  function renderApp() {
    if (!mounted || !context) return
    render(template.call(shim.instance), context)
  };

  // no reactive properties yet
  invokeLifeCycleHook(hooks.beforeCreate)

  Object
    .entries(methods)
    .forEach(([name, func]) => (shim.instance[name] = func))

  // add render & mount method to app instance
  // which can be called after the app is returned from tis function
  shim.render = renderApp

  shim.mount = function (ctx) {
    context = ctx
    mounted = true
    // render the app
    shim.render()
    // call mounted after the app was rendered
    // for the first time
    invokeLifeCycleHook(hooks.mounted)
    return shim
  }

  // create reactive getter/setter pairs from
  // object properties returned by the data function
  const props = Object.fromEntries(
    Object
      .keys(_data)
      .map(key => [key, {
        get() {
          return _data[key]
        },
        // re-render the app and trigger hooks/watcher
        // is a setter is called
        set(value) {
          const oldVal = _data[key]
          _data[key] = value
          if (mounted) {
            invokeLifeCycleHook(hooks.beforeUpdate)
            shim.render()
            invokeLifeCycleHook(hooks.updated)
            invokeWatcher(key, value, oldVal)
          }
        }
      }])
  )

  // expose data properties on the shim instance
  Object.defineProperties(shim.instance, props)

  // call created hook, now since the app has the
  // reactive properties
  invokeLifeCycleHook(hooks.created)

  return shim
}


let x = 5

export const inc = () => {
  x++
  return x
}