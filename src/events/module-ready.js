import { Subscriber, Event } from '@pollon/message-broker'
import { EVENTS } from './events'

class KernelModuleReadyEvent extends Event{
    constructor( module, args ){
        super(EVENTS.MODULE_READY)
        this.module = module
        this.args = args
    }
}

export function ModuleReady( scope ){
    let Signal
    Signal = ( module, args ) =>{
        return scope.publisher.fire(EVENTS.MODULE_READY, new KernelModuleReadyEvent(module, args), scope)
    }

    Signal.subscribe = ( handler, once ) =>{
        let sub = {}

        sub[EVENTS.MODULE_READY] = { method: handler, once: !!once }
        scope.Bus.add(new Subscriber(sub))
    }
    return Signal
}
