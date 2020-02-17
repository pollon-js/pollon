import { Route } from './route'
import { Router } from './router'
import { scan, create } from './stack'
import { resolve, validate } from './tree-path-resolver'
import { wait } from '../utils/wait'

let createRouteHandler = function( route ){
    return ( ...flash ) =>{
        return scan(this.baseUrl, route, this.kernel.getModule.bind(this.kernel), this.Router.patternMatch.bind(this.Router))
            .then( stack =>{
                let path, parsed
                parsed = Route.parse(stack[stack.length-1].pattern)
                path = parsed[0].replace(/^[\^]/, '')
                path = path.replace(/\/$/, '')
                if( path && !this.currentPath.match(new RegExp('^'+path+'$')) ){
                    console.warn(path, this.currentPath)
                    throw new Error(`Pollon: [router:not-found] route not found for ${this.currentPath}`)
                }
                return stack
            })

            .then( stack =>{
                if( !this._404 ){
                    return Promise.resolve()
                }
                let promise = this._404.module? Promise.resolve(this._404.module) : create(this.baseUrl, this._404, this.kernel.getModule.bind(this.kernel))
                return promise.then( module404 =>{
                    this._404.module = module404
                    return resolve(this.stack, stack, this.currentPath, this.lastFetchedUrl, this._404, ...flash)
                })

            })
            // Non existent module
            .catch( reason =>{
                console.warn(reason)
                let promise = this._404.module? Promise.resolve(this._404.module) : create(this.baseUrl, this._404, this.kernel.getModule.bind(this.kernel))
                return promise.then( module404 =>{
                    this._404.module = module404
                    return {
                        on: [this._404],
                        off: (this.stack || []).reverse(),
                        active: [this._404]
                    }
                })

            })
            .then( diff =>{
                let routeArgs = route.args || []
                let args = routeArgs.concat(flash)

                return this.workflow.reduce(( a, b ) =>{
                    let current = diff.on[diff.on.length - 1]
                    if( !current ){
                        current = diff.off[0]
                    }
                    return a.then(() => { return b(current, ...args) })
                }, Promise.resolve())
                    .then(() => diff )
                    .catch( reason =>{
                        console.log(reason)

                        if( reason && reason.url ){
                            throw reason
                        }

                        return {
                            on: [],
                            off: [],
                            active: diff.active,
                            preventNavigation: true,
                            reason: `Pollon [router:lifecycle] A navigation policy prevented navigation to ${this.Router.current.hash}`
                        }

                    })
            })
            .then( diff =>{
                if( diff.on && diff.off ){
                    return validate(this, diff, flash)
                        // canActivate or canDeactivate returned false
                        .catch( reason =>{
                            console.log(reason)
                            console.warn('Pollon [router:lifecycle] failed to activate or deactivate module', this.Router.current.hash)
                            //return diff;
                            //throw reason;
                            if( reason && reason.url ){
                                throw reason
                            }

                            return {
                                on: [],
                                off: [],
                                active: diff.active,
                                preventNavigation: true,
                                reason: `Pollon [router:lifecycle] failed to activate or deactivate module ${this.Router.current.hash}`
                            }
                        })
                }

                throw new Error(`Pollon [router:not-found] route ${route.name} not found`)
            })
            .then( diff =>{
                let deactivateStack, activateStack, Dstack, Astack, moduleBeforeNavigation
                moduleBeforeNavigation = this.kernel.currentModule

                if( diff.preventNavigation ){
                    throw diff.reason
                }

                Dstack = Array.prototype.slice.apply(diff.off)
                Astack = Array.prototype.slice.apply(diff.on)
                deactivateStack = ( data ) =>{
                    if( !data ){
                        return Promise.resolve()
                    }
                    console.info(`Pollon [router:deactivating] ${data.ID}`)
                    return this.kernel.deactivate(data.path)
                        .then(() =>{
                            var el = Dstack.shift()
                            return deactivateStack(el)

                        })
                }

                activateStack = ( data ) =>{
                    this.kernel.currentModule = null
                    if( !data ){
                        return Promise.resolve()
                    }
                    console.info('Pollon [router:activating]', data.ID, 'route-params:', data.args, 'injected-params:', flash)
                    var params = data.args || []
                    params = (params.slice()).concat(flash || [])
                    return this.kernel.activate.call(this.kernel, data.path, ...params)
                        .then(() =>{
                            var el = Astack.shift()
                            return activateStack(el)
                        })
                }
                let D = Dstack.shift()
                return deactivateStack(D)
                    .then(() =>{
                        let A = Astack.shift()
                        return activateStack(A)
                            .then(() => {
                                if( this.stack.length ){
                                    let params
                                    !diff.on.length &&
                                this.stack[this.stack.length-2] &&
                                this.stack[this.stack.length-2].module &&
                                this.stack[this.stack.length-2].module.resumeFromChildren &&
                                ( params = (this.stack[this.stack.length-2].args || []).slice().concat(flash || []) ) &&
                                this.stack[this.stack.length-2].module.resumeFromChildren(...params)
                                }

                                this.stack = diff.active
                                this.lastFetchedUrl = this.Router.current.hash
                                this.kernel.currentModule = (diff.active && diff.active[diff.active.length-1].module)
                                this.kernel.busy(false)
                                return true
                            })
                            .catch( reason => {
                                this.kernel.currentModule = moduleBeforeNavigation
                                this.kernel.busy(false)
                                throw reason
                            })
                    })
            })
    }
}



export class RequestHandler{

    get currentPath(){
        return this.Router.current.hash
    }

    constructor( app, options ){

        this.Router = new Router(app.baseUrl)
        this.Router.onNavigationStart = this.onNavigationStart.bind(this)
        this.baseUrl = app.baseUrl
        this.appRoot = app.selector
        this.lastFetchedUrl = null
        this.kernel = app.kernel
        this.workflow = options.workflow || []
        this.stack = []
        this.fallbackStack = []
        this._404 = null

        if( options.routes && Array.isArray(options.routes) ){
            this.map(options.routes)
        }


    }

    map( routes ){
        routes = Array.isArray(routes)? routes : [routes]

        routes.forEach( route =>{
            if( !route.name ){
                return
            }
            if( this.Router.getByName(route.name) ){
                console.warn(`Pollon [router:map] Skipping ${route.name}: route already exists`)
            }
            route = new Route(route)
            route.handler = createRouteHandler.call(this, route)
            if( '404' == route.name && !this._404 ){
                this._404 = route
            }

            this.Router.add(route)
        })
    }

    listen(){
        this.Router.listen()
    }

    canNavigate(){
        if( this.kernel.busy() ){
            return false
        }
        return true
    }

    onNavigationStart(route, ...args){
        this.kernel.busy(true)
    }

    navigate( route, ...args){
        let moduleBeforeNavigation
        return wait(1)
            .then(() =>{
                if( !this.canNavigate() ){
                    return
                }
                moduleBeforeNavigation = this.kernel.currentModule
                return this.Router.navigate(route, ...args)
            })
            .catch( reason => {
                this.kernel.currentModule = moduleBeforeNavigation
                this.kernel.busy(false)
                throw reason
            })

    }

    navigateBack(){
        let moduleBeforeNavigation
        return wait(1)
            .then(() =>{
                if( !this.canNavigate() ){
                    return
                }
                moduleBeforeNavigation = this.kernel.currentModule
                return this.Router.navigateBack()
            })
            .catch( reason => {
                this.kernel.currentModule = moduleBeforeNavigation
                this.kernel.busy(false)
                throw reason
            })
    }

    navigateForward(){
        let moduleBeforeNavigation
        return wait(1)
            .then(() =>{
                if( !this.canNavigate() ){
                    return
                }
                moduleBeforeNavigation = this.kernel.currentModule
                return this.Router.navigateForward()
            })
            .catch( reason => {
                this.kernel.currentModule = moduleBeforeNavigation
                this.kernel.busy(false)
                throw reason
            })
    }
}
