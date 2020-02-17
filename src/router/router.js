let clearSlashes = function( path ){
    return path && path.toString().replace(/^\//, '').replace(/\/$/, '')
}

export class Router{

    constructor( baseUrl ){
        this.routes = {}
        this.current = {}
        this.mode = 'onpopstate' // "onhashchange";
        //this.mode = "onhashchange";
        this.initialized = false
        this.preventPushStateForInnerRecursiveCalls = false
        this.baseUrl = baseUrl
        this.onNavigationStart = (() =>{})
        this.recursiveCounter = 0
    }

    patternMatch( pattern ){
        let match
        if( undefined === this.current.hash ){
            return false
        }
        pattern = clearSlashes(pattern)
        match = this.current.hash.match(pattern)
        if( match ){
            match.shift()
            return match
        }

        return false
    }

    match( routes ){
        let match
        let entries = Object.entries(routes)
        if( undefined === this.current.hash ){
            return false
        }

        for( let [, route] of entries ){
            match = this.patternMatch(route.pattern)
            if( match ){
                return [route, match]
            }
        }

        return false
    }

    add( route ){
        this.routes[route.name] = route
    }

    remove( route ){
        let routes

        routes = this.routes.filter( r =>{
            return r.pattern != route.pattern
        })

        this.routes = routes
    }

    getByName( name ){
        return this.routes[name] && this.routes[name]
    }

    executeRoute( route, ...vars ){
        let match, found
        this.current.hash = clearSlashes(route)

        found = this.match(this.routes)
        if( !found ){
            return Promise.reject(`Pollon: [router:route:not-found] Route ${route} not found`)
        }

        match = [].concat(found[1] || [])
        if( vars ){
            match = found[1].concat(vars)
        }

        return found[0].handler.apply({}, match)
            .then( success =>{
                if( !success ){
                    return
                }
                this.recursiveCounter = 0
                if( 'onhashchange' == this.mode ){
                    window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + clearSlashes(route)
                }else{
                    let method = this.initialized? 'pushState' : 'replaceState'
                    this.initialized = true
                    if( !this.preventPushStateForInnerRecursiveCalls ){
                        var url = document.createElement('a')
                        url.href = window.location.origin.replace(/$\/+/, '') +'/'+ route.replace(/^\/+/, '')
                        history[method](null, null, url.href)
                    }
                }
            })

    }

    listen(){
        window[this.mode] = ( ...args ) => {
            let fragment
            if( 'onhashchange' == this.mode ){
                fragment = window.location.href.match(/#(.*)$/)
                fragment = fragment ? fragment[1] : ''
            }else{
                fragment = clearSlashes(decodeURI(location.pathname + location.search))
                fragment = fragment.replace(/\?(.*)$/, '')
            }
            this.preventPushStateForInnerRecursiveCalls = true
            if( fragment == this.current.hash ){
                this.navigate(this.current.hash, undefined)
                return
            }

            this.navigate(fragment, undefined)
        }
    }

    navigate( route, ...args ){
        this.recursiveCounter++

        if( this.recursiveCounter >= 10 ){ throw 'Pollon [router:lifecycle] navigation loop detected' }

        route = this.baseUrl + route
        if( this.current.hash === route ){ return Promise.resolve() }

        let old = this.current.hash
        return Promise.resolve().then(() =>{ return this.onNavigationStart(route, ...args)})
            .then(() =>{ return this.executeRoute(route, ...args) })
            .then(() =>{ this.preventPushStateForInnerRecursiveCalls = false })
            .catch( reason => {
                this.current.hash = clearSlashes(old)
                if( this.mode == 'onhashchange' ){
                    window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + old
                }else{
                    history.pushState(null, null, window.location.href)
                }
                console.warn(reason)
                if( reason && reason.url ){
                    console.warn(`Pollon [router:lifecycle] Redirecting to ${reason.url}`)
                    return this.navigate(reason.url, reason.args || undefined)
                }

                this.recursiveCounter = 0
                throw reason
            })
    }

    navigateBack(){
        window.history.back()
    }

    navigateForward(){
        window.history.forward()
    }
}
