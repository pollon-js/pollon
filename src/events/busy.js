import { Subscriber, Event } from '@pollon/message-broker'
import { EVENTS } from './events'

class KernelStatusEvent extends Event{
    constructor( status ){
        super(EVENTS.STATUS)
        this.status = status? 'busy' : 'idle'
    }
}

export function Busy( scope ){
    let isBusy, Busy
    Busy = ( value ) =>{
        if( undefined === value ){
            return !!isBusy
        }
        isBusy = !!value
        return scope.publisher.fire(EVENTS.STATUS, new KernelStatusEvent(!!value), scope)
    }

    Busy.subscribe = ( handler, once ) =>{
        let sub = {}

        sub[EVENTS.STATUS] = { method: handler, once: !!once }
        scope.Bus.add(new Subscriber(sub))
    }
    return Busy
}
