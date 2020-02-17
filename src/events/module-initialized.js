import { Subscriber, Event } from '@pollon/message-broker'
import { EVENTS } from './events'

class KernelModuleInitializedEvent extends Event{
    constructor( module ){
        super(EVENTS.MODULE_INITIALIZED)
        this.module = module
    }
}

export function ModuleInitialized( scope ){
    let Signal
    Signal = ( module ) =>{
        return scope.publisher.fire(EVENTS.MODULE_INITIALIZED, new KernelModuleInitializedEvent(module), scope)
    }

    Signal.subscribe = ( handler, once ) =>{
        let sub = {}

        sub[EVENTS.MODULE_INITIALIZED] = { method: handler, once: !!once }
        scope.Bus.add(new Subscriber(sub))
    }
    return Signal
}
