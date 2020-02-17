export function isString( input ){
    return 'string' == Object.prototype.toString.call(input).match(/^\[object\s(.*)\]$/)[1].toLowerCase()
}