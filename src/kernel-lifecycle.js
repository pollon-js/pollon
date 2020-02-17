import { Query } from '@pollon/light-dom'
import { StateMachine } from '@pollon/state-machine'
import { isString } from './utils/is-string'
import { INJECTION_MODES } from './kernel-injection-modes'

let signalViewStatus = function( node, state ){
    node.setAttribute('data-view-state', state)
}

let insertDOM = ( context ) => {
    let root

    if( !isString(context.root) ){
        throw new Error('Pollon: [kernel:lifecycle] Root must be a valid CSS selector')
    }
    root = Query(document).one(context.root)
    if( !root.length ){
        throw new Error('Pollon: [kernel:lifecycle] Root must be a valid node')
    }

    signalViewStatus(context.node.get(0), 'detached')
    switch( context.injectionMode ){
    case KernelLifecycle.INJECTION_MODES.APPEND:
        root.append(context.node)
        break
    case KernelLifecycle.INJECTION_MODES.PREPEND:
        root.prepend(context.node)
        break
    case KernelLifecycle.INJECTION_MODES.REPLACE:
        root.replace(context.node)
        break
    }
}

let isAttachedToDOM = function( node ){
    return document.body == node || !!(document.body.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY)
}

export class KernelLifecycle{

    static get EVENTS(){
        return StateMachine.EVENTS
    }

    static get INJECTION_MODES(){
        return INJECTION_MODES
    }

    constructor( id ){
        this.root = null
        this.injectionMode = null
        this.ID = id
        this.node = Query.element('div', {'data-view': id})
        this.FSM = new StateMachine({
            initial: 'detached',
            transitions: {
                'detached':{
                    'initialize': 'initialized'
                },
                'initialized':{
                    'load': 'loaded'
                },
                'loaded':{
                    'applyBindings': 'bound'
                },
                'bound':{
                    'dispose': 'disposed'
                },
                'disposed':{
                    'restart': 'initialized'
                }
            }
        })
    }

    initialize( appName ){
        if( !this.FSM.can('initialize') ){
            return Promise.resolve(appName)
        }
        return new Promise(( resolve, reject ) =>{
            signalViewStatus(this.node.get(0), 'detached')
            insertDOM(this)

            resolve(appName)
        }).then(this.FSM.handle.bind(this.FSM, 'initialize'))
    }

    load( DOM ){
        if( !this.FSM.can('load') ){
            return Promise.resolve(DOM)
        }

        return new Promise(( resolve, reject ) => {
            if( !isAttachedToDOM(this.node.get(0)) ){
                insertDOM(this)
            }

            // make sure we have always a template to work with;
            if( undefined === DOM ){
                DOM = Query.element('<div>').get(0)
            }

            this.node.replace(DOM)
            signalViewStatus(this.node.get(0), 'loaded')
            resolve(DOM)
        }).then(this.FSM.handle.bind(this.FSM, 'load'))
    }

    applyBindings( ...args ){
        if( !this.FSM.can('applyBindings') ){
            return Promise.resolve()
        }

        return this.FSM.handle('applyBindings', args)
            .then(() =>{ signalViewStatus(this.node.get(0), 'ready') })
    }

    dispose(){
        if( !this.FSM.can('dispose') ){
            return Promise.resolve()
        }
        return this.FSM.handle('dispose', this.node.get(0))
            .then( preventUnbind =>{
                if( !preventUnbind ){
                    this.node.unbind()
                }
                signalViewStatus(this.node.get(0), 'disposed')
            }).then(() =>{ return this.FSM.handle('restart') })
    }
}
