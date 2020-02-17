import { isObject } from './utils/is-object'
import { Broker as EventBroker, Broker as ProviderBroker, Publisher, Event } from '@pollon/message-broker'
import { Kernel } from './kernel'
import { HTML as HTMLLoader } from './templates/html'
import { RequestHandler } from './router/request-handler'

class ApplicationStartedEvent extends Event{
    constructor( name ){
        super(Application.STARTED)
        this.appName = name
    }
}

class NavigationStartEvent extends Event{
    constructor(){
        super(Application.NAVIGATION_START)
    }
}

class NavigationEndEvent extends Event{
    constructor(){
        super(Application.NAVIGATION_END)
    }
}


let registry = {}
export class Application{

    static get STARTED(){
        return 'application.started'
    }

    static get NAVIGATION_START(){
        return 'application.navigation.start'
    }

    static get NAVIGATION_END(){
        return 'application.navigation.end'
    }

    static get( name ){
        if( registry[name] ){
            return registry[name].instance
        }
    }

    get busy(){
        return this.kernel.busy
    }

    get moduleInitialized(){
        return this.kernel.moduleInitialized
    }

    get moduleLoaded(){
        return this.kernel.moduleLoaded
    }

    get moduleReady(){
        return this.kernel.moduleReady
    }

    get moduleDisposed(){
        return this.kernel.moduleDisposed
    }

    constructor( name, options ){
        if( !name ){
            throw new Error('Pollon: [application] application must have a name')
        }
        if( registry[name] && registry[name].instance ){
            throw new Error(`Pollon: [application:exists] another application called ${name} already exists`)
        }

        this.name = name
        this.root = options.root || 'body'
        this.baseUrl = (options.baseUrl !== undefined)? options.baseUrl : './'

        let loader = options.loader || null
        let binder = options.binder || null
        this.kernel = new Kernel(name, loader, binder)
        this.publisher = new Publisher([Application.STARTED, Application.NAVIGATION_START, Application.NAVIGATION_END])
        this.Templates = { HTML: new HTMLLoader(this.name) }
        this.Bus = new EventBroker()
        this.Providers = new ProviderBroker()
        this.Bus.add(this.publisher)

        this.busy.subscribe(( _, args ) =>{
            if( args.status == 'busy' ){
                document.querySelector(this.root).classList.add('is-transitioning')
                this.publisher.fire(Application.NAVIGATION_START, new NavigationStartEvent())
                return
            }
            document.querySelector(this.root).classList.remove('is-transitioning')

            this.publisher.fire(Application.NAVIGATION_END, new NavigationEndEvent())

            if( !this.kernel.currentModule ){
                return
            }
            document.querySelector(this.root).setAttribute('active-view', this.kernel.currentModule.name)
            if( this.kernel.currentModule.title ){
                document.title = this.kernel.currentModule.title
            }
        })

        registry[this.name] = {
            instance: this,
            prepared: false,
            started: false,
            loader: loader,
            plugins:[],
            routes: [],
            navigationWorkflow: []
        }

        binder.init(this)
    }

    loadText( uri ){
        if( registry[this.name].loader ){
            return registry[this.name].loader.loadText(uri)
        }
        throw new Error('Pollon: [application:strategies:unset] LoadText strategy is missing.')
    }

    load( uri ){
        if( registry[this.name].loader ){
            return registry[this.name].loader.load(uri)
        }
        throw new Error('Pollon: [application:strategies:unset] Load strategy is missing.')
    }

    loadPlugins( uris ){
        if( registry[this.name].loader ){
            return registry[this.name].loader.loadPlugins(uris)
        }

        if( !uris.length ){
            throw new Error('Pollon: [application:strategies:unset] Plugin loading strategy is missing')
        }
        return []
    }

    resolvePluginURI( ID, uri ){
        if( registry[this.name].loader ){
            return registry[this.name].loader.resolvePluginURI(ID, uri)
        }

        return uri
    }

    routes( routes ){
        registry[this.name].routes = registry[this.name].routes.concat(...routes)
        return this
    }

    navigationStep( ...steps ){
        registry[this.name].navigationWorkflow = registry[this.name].navigationWorkflow.concat(...steps)
        return this
    }

    use( configs, uri ){
        var plugsIds
        plugsIds = Object.keys(configs)

        plugsIds.forEach( ID =>{
            registry[this.name].plugins.push({
                name: ID,
                url: this.resolvePluginURI(ID, uri),
                config: configs[ID]
            })
        })

        return this
    }

    prepare(){
        if( !registry[this.name] ){
            return
        }

        if( registry[this.name].prepared ){
            return
        }

        registry[this.name].prepared = true

        let plugins = []
        registry[this.name].plugins.forEach( plugin =>{
            plugins.push(plugin.url)
        })

        return this.loadPlugins(plugins)
            .then(( [...loaded] ) =>{
                let i = -1
                return loaded.map( plugin =>{
                    let config, name
                    i++

                    name = registry[this.name].plugins[i].name
                    config = registry[this.name].plugins[i].config
                    config = isObject(config)? config : config(this.name)
                    config = isObject(config)? config : {}
                    if( !plugin.install ){
                        return {
                            name: name,
                            canInstall: false,
                            plugin: plugin
                        }
                    }

                    return {
                        name: name,
                        canInstall: true,
                        plugin: plugin,
                        config: config
                    }
                })
                    .reduce((prev, current) =>{
                        return prev.then(() =>{
                            let promise

                            if( current.canInstall ){
                                promise = current.plugin.install(this, current.config)
                            }

                            promise = (promise && promise.then)? promise : Promise.resolve()
                            return promise.then(() => { return current })
                        })
                            .then(current =>{
                                console.info(`Pollon: [Plugin:installed] ${current.name}`)
                            })
                            .catch(console.error.bind(console))
                    }, Promise.resolve())
            })

    }

    start(){
        if( !registry[this.name] ){
            return
        }

        if( registry[this.name].started ){
            return
        }

        registry[this.name].started = true

        if( !registry[this.name].routes.length ){
            return
        }

        let requestHandler = new RequestHandler(this, { routes: registry[this.name].routes, workflow: registry[this.name].navigationWorkflow })
        this.navigate = requestHandler.navigate.bind(requestHandler)
        this.navigateBack = requestHandler.navigateBack.bind(requestHandler)
        this.navigateForward = requestHandler.navigateForward.bind(requestHandler)

        this.currentPath = () =>{
            return requestHandler.currentPath
        }

        let root = registry[this.name].routes.filter( route =>{
            return !!route.default
        })

        requestHandler.listen()

        this.publisher.fire(Application.STARTED, new ApplicationStartedEvent(this.name))
        return root.length && this.navigate(root[0].pattern)
    }
}
