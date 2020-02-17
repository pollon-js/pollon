export function toUrl( part, base ){
    base = base || './'

    if( 0 === part.indexOf('@') ){
        base = ''
        //part = part.substr(1)
    }
    /*
    if( base.indexOf('/', base.length - 1) === -1 ){
        base += '/';
    }
*/    
    return base + part
}