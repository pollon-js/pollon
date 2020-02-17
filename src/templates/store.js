export class Store{
    constructor(){
        this.store = {}
    }

    put( key, value ){
        this.store[key] = value
    }

    get( key ){
        return this.store[key]
    }
}