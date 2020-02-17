import { isString } from '../utils/is-string'
import { isNode } from '../utils/is-node'
import { Loader } from './loader'

let getMainNode = ( template ) =>{
    let el, nodes
    el = document.createElement('div')
    el.innerHTML = template
    nodes = el.childNodes
    
    if( !nodes.length ){
        return el.cloneNode(true)
    }

    if( 1 == nodes.length ){
        return nodes[0].cloneNode(true)
    }

    let filtered
    filtered = []

    nodes.forEach( node =>{
        if( 3 == node.nodeType ){
            let result = /\S/.test(node.nodeValue)
            if( !result || !node.nodeValue.trim() ){
                return
            }
        }
        filtered.push(node)
    })

    if( filtered.length > 1 ){
        let el = document.createElement('div')
        filtered.forEach( f =>{
            el.appendChild(f)
        })

        return el.cloneNode(true)
    }

    return filtered[0].cloneNode(true)
}

export class HTML extends Loader{
    constructor( appName ){
        super(appName)
        this.extension = '.jpt'
    }

    get( input ){
        let info

        if( isString(input) ){
            if( !this.canParse(input) ){
                return Promise.reject(`Pollon: [template:html] ${input} element is unparseable by the HTML loader`)
            }

            info = this.getInfo(input)
            
            if( this.cache.get(info.id) ){
                return new Promise(( resolve, reject ) =>{
                    resolve(this.cache.get(info.id).cloneNode(true))
                })
            }
            
            return super.get(input)
                .then( text =>{
                    let node = getMainNode(text.trim())
                    this.cache.put(info.id, node)
                    return node.cloneNode(true)
                })
        }
        if( !isNode(input) ){
            throw new Error('Pollon: [template:html] You must pass either a file path or a DOM Node for the HTML Loader to work properly')
        }

        let node = getMainNode(input)
        return node.cloneNode(true)
    }

    onUnloadable( url, info, reason ){
        return super.onUnloadable(url, info, reason)
            .then( message =>{
                return getMainNode(`<div class="view-404">Template ${message}</div>`)
            })
            .catch( message =>{
                return getMainNode(`<div class="view-404">Template ${message}</div>`)
            })

    }
}