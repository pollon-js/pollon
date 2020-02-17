import { INJECTION_MODES } from '../kernel-injection-modes'
import { Route } from './route'
import { toUrl } from './to-url'


let validateInjectionOptions = function( mode, node, module ){
    let injectionMode

    if( !mode ){
        mode = INJECTION_MODES.APPEND
    }

    if( !node ){
        throw new Error(`Pollon: [Router] Invalid injection options for Module  "${module.ID}"`)
    }

    injectionMode = Object.values(INJECTION_MODES).filter(( m ) => {
        return ( mode == m )
    })


    if( !injectionMode.length ){
        throw new Error(`Pollon: [Router] Invalid injection method for Module  "${module.ID}"`)
    }

    return {
        point: node,
        mode: injectionMode[0]
    }
}

let create = ( baseUrl, root, getModuleStrategy ) => {
    root.path = root.path || toUrl(root.ID, baseUrl)
    return getModuleStrategy(root.path)
        .then( module => {
            if( module.Runtime && root.injection.point ){
                let options = validateInjectionOptions(root.injection.mode, root.injection.point, module)
                module.Runtime.injectionMode = options.mode
                module.Runtime.root = options.point

            }
            return module
        })
}

let discoverChildRoute = ( routes, parent, matchRouteStrategy ) =>{
    let found
    routes.forEach(subroute  =>{
        if( found ){
            return
        }
        if( !subroute.pattern ){
            return
        }

        let baseParsed, base, partParsed, part, union, match
        baseParsed = Route.parse(parent.pattern)
        partParsed = Route.parse(subroute.pattern)

        base = baseParsed[0].replace(/^[\^]/, '')
        part = partParsed[0].replace(/^[\^]/, '')

        union = base? base +'/'+ part : part
        union = union.replace(/\/$/, '')

        match = matchRouteStrategy(new RegExp(union))

        if( match ){
            found = new Route(subroute)
            found.pattern = union

            found.args = match.slice(-partParsed[1].length)
            found.parentID = parent.ID
            console.info(`Pollon: [router] Discovering new child route: ${found.name} with: `, found.args)
        }
    })

    if( !found ){
        new Error(`Pollon: [router:child-route-not-found] Child route for ${parent.name} not found`)
    }
    return found
}


let discover = function( baseUrl, root, stack, getModuleStrategy, matchRouteStrategy ){
    root.path = root.path || toUrl(root.ID, baseUrl)
    return create(baseUrl, root, getModuleStrategy)
        .then( module => {
            if( stack.length ){
                stack[stack.length-1].module = module
            }

            return module
        })
        .then( module =>{
            if( !module ){
                return stack
            }

            if( !module.Router ){
                return stack
            }

            module.Router.routes = Array.isArray(module.Router.routes)? module.Router.routes : []

            let found = discoverChildRoute(module.Router.routes, root, matchRouteStrategy)

            if( found ){
                stack.push(found)
                return discover(baseUrl, found, stack, getModuleStrategy, matchRouteStrategy)
            }

            return stack
        })
}

let scan = ( baseUrl, route, getModuleStrategy, matchRouteStrategy ) => {
    return discover(baseUrl, route, [route], getModuleStrategy, matchRouteStrategy)
}

export {
    create,
    scan
}
