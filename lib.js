'use strict'

import { render as litRender } from 'https://unpkg.com/lit-html@1.4.1/lit-html.js'
export { html } from 'https://unpkg.com/lit-html@1.4.1/lit-html.js'

export function render (app, context) {
  // get app data
  const _data = app.data()
  let mounted = false

  // use to call life cycle hooks if any
  function invokeLifeCycleHook (hook) {
    // pass the current instance as `this`
    // in order to make the reactive properties available
    if (hook) hook.call(app)
  }

  // call this function whe data changes
  function _render () {
    litRender(app.template, context)
  };

  // no reactive properties yet
  invokeLifeCycleHook(app.beforeCreate)

  // assign methods if any
  if (app.methods) {
    Object
      .entries(app.methods)
      .forEach(([name, func]) => (app[name] = func))
  }

  // expose data properties as getter / setter pairs
  // on the application instance and call
  // hooks & render function when any setter is called
  Object.keys(_data).forEach(key => {
    Object.defineProperty(app, key, {
      // lookup the given key in the object
      // returned by the data function
      get () {
        return _data[key]
      },
      // set its value
      set (value) {
        const oldVal = _data[key]
        _data[key] = value
        // if the component is mounted,
        // invoke the update hooks and
        // re-render the component
        if (mounted) {
          invokeLifeCycleHook(app.beforeUpdate)
          _render()
          invokeLifeCycleHook(app.updated)
          const watcher = app.watch[key]
          if (typeof watcher === 'function') {
            watcher.call(app, value, oldVal)
          }
        }
      }
    })
  })

  // call created hook, now since the app has the
  // reactive properties
  invokeLifeCycleHook(app.created)

  // render the app
  _render()
  mounted = true

  // call mounted after the app was rendered
  // for the first time
  invokeLifeCycleHook(app.mounted)
  return app
}
