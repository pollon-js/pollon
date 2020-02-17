import { isFunction } from './utils/is-function'
import { wait } from './utils/wait'
import { guid } from './utils/guid'
import { Broker as EventBroker, Publisher } from '@pollon/message-broker'
import { KernelLifecycle } from './kernel-lifecycle'
import { Module } from './module'
import { Application } from './application'
import { EVENTS } from './events/events'
import { Busy } from './events/busy'
import { ModuleInitialized } from './events/module-initialized'
import { ModuleLoaded } from './events/module-loaded'
import { ModuleReady } from './events/module-ready'
import { ModuleDisposed } from './events/module-disposed'

let getTemplateLoader = ( appName ) =>{
    return ( module ) =>{
        let App = Application.get(appName)
        if( module && module.View && module.View.template ){
            return App.Templates.HTML.get(module.View.template)
        }
    }
}

let applyBindings = ( scope, DOM, module ) =>{
    return DOM
}

export class Kernel{

    constructor( appName, loader, binder ){
        let moduleLoader, DOMBinder

        if( loader && loader.loadModule ){
            moduleLoader = loader.loadModule.bind(loader)
        }else{
            throw new Error('Pollon: [application:strategies:unset] Module loading strategy is missing.')
        }

        if( binder && binder.applyBindings ){
            DOMBinder = binder.applyBindings.bind(binder)
        }else{
            console.warn('Pollon: [application:strategies:unset] MVVM strategy is missing. Default strategy is being used (no binding)')
            DOMBinder = applyBindings
        }

        this.loadTemplate =  getTemplateLoader(appName)
        this.loadModule = moduleLoader
        this.applyBindings = DOMBinder

        this.appName = appName
        this.modules = {}
        this.currentModule = null
        this._transitionDelay = 300
        this.busy = Busy(this)
        this.moduleInitialized = ModuleInitialized(this)
        this.moduleLoaded = ModuleLoaded(this)
        this.moduleReady = ModuleReady(this)
        this.moduleDisposed = ModuleDisposed(this)
        this.busy = Busy(this)

        this.Bus = new EventBroker()
        this.publisher = new Publisher([EVENTS.STATUS, EVENTS.MODULE_INITIALIZED, EVENTS.MODULE_DISPOSED, EVENTS.MODULE_LOADED, EVENTS.MODULE_READY])
        this.Bus.add(this.publisher)
    }

    getModule( moduleID ){
        if( this.modules[moduleID] ){
            return Promise.resolve(this.modules[moduleID])
        }

        let promise

        try{
            promise = this.loadModule(this.appName, moduleID)
        }catch( e ){
            throw new Error(`Pollon: [Kernel:module:loading] Cannot load module ${moduleID}: ${e}`)
        }

        if( !promise ){
            throw new Error(`Pollon: [Kernel:module:loading] Cannot load module ${moduleID}`)
        }

        if( !promise.then ){
            promise = Promise.resolve(promise)
        }

        return promise
            .then( module =>{
                module = Module.create(module)

                module.ID = moduleID
                module.Runtime = new KernelLifecycle(moduleID)
                this.modules[moduleID] = module
                return module
            })
            .then( module => {
                module.Runtime.FSM.on(KernelLifecycle.EVENTS.ON, 'initialize', ( sender, ev ) =>{
                    module.appName = ev.args[0]
                    this.moduleInitialized(module.name)
                    return module.Lifecycle && isFunction(module.Lifecycle.init) && module.Lifecycle.init()
                })

                module.Runtime.FSM.on(KernelLifecycle.EVENTS.ENTERED, 'loaded', ( sender, ev ) =>{
                    this.moduleLoaded(module.name)
                    return module.Lifecycle && isFunction(module.Lifecycle.onLoad) && module.Lifecycle.onLoad(...(ev.args || []))
                })

                module.Runtime.FSM.on(KernelLifecycle.EVENTS.ENTERED, 'bound', ( sender, ev ) =>{
                    return module.Lifecycle && isFunction(module.Lifecycle.onApplyBindings) && module.Lifecycle.onApplyBindings.apply(module.Lifecycle, ...(ev.args || []))
                })

                module.Runtime.FSM.on(KernelLifecycle.EVENTS.ENTERED, 'disposed', ( sender, ev ) =>{
                    this.moduleDisposed(module.name)
                    return module.Lifecycle && isFunction(module.Lifecycle.onDispose) && module.Lifecycle.onDispose(...(ev.args || []))
                })

                module.onReady = module.onReady && module.onReady.bind(module) || ( (...args) => { return this.moduleReady(module.name, args) })

                return module
            })
    }

    canDeactivateModule( module ){
        if( !module.Runtime ){
            return Promise.resolve(true)
        }

        return new Promise(( resolve, reject ) =>{
            let promise

            try{
                promise = (module.canDeactivate && module.canDeactivate(this.appName))
            }catch( e ){
                resolve(false)
            }

            if( promise && promise.then ){
                return promise
                    .then( canDeactivate =>{
                        resolve(canDeactivate)
                    }).catch(resolve.bind(resolve))
            }

            return resolve(promise)
        })
    }

    canActivateModule( module, ...args ){
        if( !module.Runtime ){
            return Promise.resolve(true)
        }
        return new Promise(( resolve, reject ) =>{
            let promise

            try{
                promise = (module.canActivate && module.canActivate(this.appName, ...args))
            }catch( e ){
                reject(e)
            }

            if( promise && promise.then ){
                return promise
                    .then( canActivate =>{ resolve(canActivate)})
                    .catch(reject.bind(reject))
            }

            return resolve(promise)
        })
    }

    deactivate( moduleID ){
        console.log('deactivate', moduleID)
        return this.getModule(moduleID)
            .then( module => {
                return this.canDeactivateModule(module)
                    .then( disposeable =>{
                        if( !disposeable ){
                            throw new Error(`Pollon: [kernel:module:deactivation] Unable to deactivate module ${moduleID}`)
                        }

                        return module.Runtime.dispose()
                    })
            })
            .catch(console.info.bind(console))
    }

    activate( moduleID, ...args ){
        let promise

        if( !moduleID ){
            return Promise.resolve()
        }

        promise = ( this.currentModule )? this.deactivate(this.currentModule.Runtime.ID) : Promise.resolve(true)
        return promise
            .then(() =>{
                return this.getModule(moduleID)
            })
            .then( module => {
                return this.canActivateModule(module, ...args)
            })
            .then( activatable => {
                if( !activatable ){
                    throw new Error(`Pollon: [kernel:module:activation] Unable to activate module ${moduleID}`)
                }
                return this.modules[moduleID].Runtime.initialize(this.appName, ...args)
            })
            .then(() => {
                let module = this.modules[moduleID]
                return this.loadTemplate(module)
            })
            .then( DOM => {
                let module = this.modules[moduleID]
                return module.Runtime.load(DOM)
            })
            .then(() => {
                let module, name
                module = this.modules[moduleID]

                if( !module.Runtime.node ){
                    return
                }

                name = module.name

                if( !name ){
                    module.name = 'unknown-module-' + guid()
                }
                module.Runtime.node.attr('data-view', module.name)
            })
            .then(() => {
                let module = this.modules[moduleID]

                return this.applyBindings(Application.get(this.appName), module.Runtime.node.get(0), module)
            })
            .then(() => {
                let module = this.modules[moduleID]
                return module.Runtime.applyBindings(...args)
            })
            .then(() => {
                return this._transitionDelay && wait(this._transitionDelay)
            })
            .then(() =>{
                this.currentModule = this.modules[moduleID]
                this.moduleReady(this.currentModule.name, args)
                return this.currentModule.onReady && this.currentModule.onReady(...args)

            })
            .catch(console.error.bind(console))
    }

    setTransitionDelay( milliseconds ){
        this._transitionDelay = +milliseconds
    }
}
