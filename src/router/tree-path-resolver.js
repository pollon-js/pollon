let fallbackSolution = ( stack, fallback ) =>{
    return Promise.resolve({
        off: stack.reverse(),
        on: [fallback],
        active: [fallback]
    })
}

let canDeactivateStack = function( requestHandler, sequence, route ){
    return sequence.then(function( module ){
        return  canSequenceProceed =>{
            return requestHandler.kernel.canDeactivateModule(module)
                .then( canProceed =>{
                    if( canProceed.url ){
                        return canProceed
                    }
                    return canProceed && canSequenceProceed
                })
        }
    }(route.module))
}

let canActivateStack = function( requestHandler, flash, sequence, route ){
    return sequence.then(function( module, args ){

        return canSequenceProceed =>{
            return requestHandler.kernel.canActivateModule(module, ...args.concat(flash))
                .then( canProceed =>{
                    if( canProceed && canProceed.url ){
                        return canProceed
                    }
                    return canProceed && canSequenceProceed
                }).catch(console.log.bind(console))
        }
    }(route.module, route.args || []))
}

export function validate( requesthandler, diff, flash ){
    if( !diff ){
        return {
            off: [],
            on: [],
            active: []
        }
    }

    return new Promise(( resolve, reject ) =>{
        diff.off.reduce(canDeactivateStack.bind(null, requesthandler), Promise.resolve(true))
            .then( canProceed => {
                if( !canProceed ){ reject() }
            })
            .then(() =>{
                return diff.on.reduce(canActivateStack.bind(null, requesthandler, flash), Promise.resolve(true))
            })
            .then( canProceed => {
                if( canProceed && canProceed.url ){
                    reject(canProceed)
                    return
                }
                if( !canProceed ){ reject(canProceed); return }
                resolve(diff)
            })
            .catch(reject.bind(reject))
    })
}


export function resolve( A, B, currentPath, lastFetchedURL, fallbackModule, ...flash ){
    let configA, configB, solution

    configA = Array.isArray(A) ? Array.prototype.slice.call(A) : []
    configB = Array.isArray(B) ? Array.prototype.slice.call(B) : []

    solution = {
        active: configB,
        on: [],
        off: []
    }

    if( configB.length ){
        let reverse, match
        //reverse = B.reverse();
        reverse = ( configB.slice() ).reverse()
        match = ( !reverse[0].pattern.length )? (currentPath == reverse[0].pattern) : currentPath.match(reverse[0].pattern)
        if( !match ){
            // route not found: go 404
            return fallbackSolution(configA, fallbackModule)
        }
    }

    // first call ever: nothing to deactivate;
    if( !configA.length ){
        solution.off = []
        solution.on = configB
        return Promise.resolve(solution)
    }

    if( !configB.length ){
        // route not found: go 404
        return fallbackSolution(configA, fallbackModule)
    }

    let indexA
    let indexB

    for( indexA = 0,  indexB = 0; indexA < configA.length; indexA++, indexB++ ){
        if( !configB[indexB] ){
            // reached the end of the stack
            break
        }

        if( configB[indexB].pattern !== configA[indexA].pattern ){
            /*
            console.log("DIFFERENT!", configB[indexB], configA[indexA])
            let Ak = Object.entries(configA[indexA]).filter( e => e[1] !== configB[indexB][e[0]]).map( entry => [entry[0], configA[indexA][entry[0]], configB[indexB][entry[0]]])
            console.log(Ak, "<=")
            */
            break
        }
        //console.log("EQUAL!", configB[indexB], configA[indexA])

    }



    //console.log(indexA, indexB)
    solution.off = ( configA.slice(indexA) || [] ).reverse()
    solution.on = (configB.slice(indexB) || [])

    if( 0 == solution.on.length && 0 == solution.off.length ){
        // same url diffrent parameters;
        /*
        if( (lastFetchedURL == currentPath) && !flash.length ){
            solution.off = [];
            solution.on = [];
        }
        */

        if( (lastFetchedURL != currentPath) || flash.length ){
            if( solution.active.length ){
                solution.off = [solution.active[solution.active.length-1]]
                solution.on = [solution.active[solution.active.length-1]]
            }
        }
    }

    return Promise.resolve(solution)
}
