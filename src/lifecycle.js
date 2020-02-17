let callIfExists = ( obj, method, ...args ) => {
    if( obj[method] ){
        return obj[method](...args)
    }
}

export class Lifecycle{
    constructor( module ){
        this.Module = module
    }

    init(){
        return callIfExists(this.Module.View, 'init')
    }

    onLoad( dom ){
        return callIfExists(this.Module.View, 'onLoad', dom)
    }

    onApplyBindings( ...args ){
        return callIfExists(this.Module.View, 'onApplyBindings', ...args)
    }

    onDispose( ...args ){
        return callIfExists(this.Module.View, 'onDispose', ...args)
    }
}