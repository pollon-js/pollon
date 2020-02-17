import { Subscriber, Event } from '@pollon/message-broker'
import { EVENTS } from './events'

class KernelModuleDisposedEvent extends Event{
    constructor( module ){
        super(EVENTS.MODULE_DISPOSED)
        this.module = module
    }
}

export function ModuleDisposed( scope ){
    let Signal
    Signal = ( module ) =>{
        return scope.publisher.fire(EVENTS.MODULE_DISPOSED, new KernelModuleDisposedEvent(module), scope)
    }

    Signal.subscribe = ( handler, once ) =>{
        let sub = {}

        sub[EVENTS.MODULE_DISPOSED] = { method: handler, once: !!once }
        scope.Bus.add(new Subscriber(sub))
    }
    return Signal
}
