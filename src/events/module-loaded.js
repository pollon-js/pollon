import { Subscriber, Event } from '@pollon/message-broker'
import { EVENTS } from './events'

class KernelModuleLoadedEvent extends Event{
    constructor( module ){
        super(EVENTS.MODULE_LOADED)
        this.module = module
    }
}

export function ModuleLoaded( scope ){
    let Signal
    Signal = ( module ) =>{
        return scope.publisher.fire(EVENTS.MODULE_LOADED, new KernelModuleLoadedEvent(module), scope)
    }

    Signal.subscribe = ( handler, once ) =>{
        let sub = {}

        sub[EVENTS.MODULE_LOADED] = { method: handler, once: !!once }
        scope.Bus.add(new Subscriber(sub))
    }
    return Signal
}
