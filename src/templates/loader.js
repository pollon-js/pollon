import { Store } from './store'
import { Application } from '../application'

export class Loader{
    constructor( appName ){
        this.appName = appName
        this.cache = new Store()
        this.extension = '.jpt'
    }

    canParse( input ){
        return -1 < input.indexOf(this.extension, input.length - this.extension)
    }

    getInfo( input ){
        var ID

        if( !this.canParse(input) ){
            return
        }

        ID = input.substring(0, input.length - this.extension.length)

        return {
            id: ID,
            path: ID + this.extension
        }
    }

    get( input ){
        let App, info
        
        if( !this.canParse(input) ){
            return Promise.reject()
        }

        info = this.getInfo(input)
        App = Application.get(this.appName)        
        return new Promise(( resolve, reject ) =>{
            App.loadText(info.path).then( text =>{
                resolve(text)
            }).catch( reason =>{
                this.onUnloadable(input, info, reason)
                    .then( message =>{
                        resolve(message)
                    })
            })
        })
    }

    onUnloadable( url, info, reason ){
        let message
        message = 'Not Found. Searched for "' + info.id + '" via path "' + info.path + '".'
        return Promise.resolve(message)
    }

}