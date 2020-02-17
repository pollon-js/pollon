import { isFunction } from './utils/is-function'
import { isObject } from './utils/is-object'

export class Module{

    static create( config ){
        if( config instanceof Module ){
            return config
        }

        if( !isObject(config) && !isFunction(config) ){
            throw new Error('Pollon: [Module:invalid] module must be either an object, a function or a Module instance')
        }
        
        if( isFunction(config) ){
            if( config.prototype && config.prototype.constructor.name ){
                config = new config()
            }else{
                config = config()    
            }
        }
        
        let module = new Module()        
        return Object.assign(config, module)
    }

    constructor(){

    }

    canActivate(){
        return true
    }

    canDeactivate(){
        return true
    }    
}