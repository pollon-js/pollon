export class Route{

    static parse( pattern ){
        let parsed, params
        params = []
        // ex: list:category</[-a-zA-Z0-9\.-]*>
        parsed = pattern.replace(/(:[^/<>]+)(?:<([^>]+)>)?/g, ( match, p1, p2 ) => {
            let constraint

            if( (p1.split(' ')).length > 1 ){
                throw new Error(`Pollon: [router:route:invalid] Invalid route pattern: ${pattern}`)
            }
            params.push(p1)
            constraint = p2 ? '('+p2+')' : '([^/]+)'
            return constraint
        })
        return [parsed, params]
    }

    constructor( config ){
        if( !config.name ){
            throw new Error('Pollon [router:route:invalid] Route must have a name!')
        }
        
        this.name = config.name
        this.pattern = Route.parse(config.pattern)[0]
        this.params = Route.parse(config.pattern)[1]

        this.path = config.path || ''
        this.ID = config.module
        this.parentID = null
        this.handler = function(){}
        this.args = null
        this.injection = {
            point: config.injection.point,
            mode: config.injection.mode
        }
    }
}