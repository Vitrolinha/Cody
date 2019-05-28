const { command } = require('../utils')

module.exports = class TempMute extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['vote', 'votes', 'votar', 'voto']
    }
    async run ({message, args, usuario, servidor}) {
        let inicio = 
    }
}