const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['shipar']
    }
    async run ({message, argsAlt}, t) {

    }
}