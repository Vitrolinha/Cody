const { command } = require('../utils')

module.exports = class TempMute extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['vote', 'votes', 'votar', 'voto']
    }
    async run ({message, argsAlt, usuario, servidor}) {
        let reg = argsAlt[0] ? argsAlt[0].replace(/[^0-9]/g, '') : message.author.id
        let user = message.guild.members.get(reg) ? message.guild.members.get(reg).user : message.author
        if(user.bot) return message.channel.send(t('comandos:vip.mentionBot', { member: message.member }))
        let userDB = await this.client.database.Users.findOne({'_id': user.id})
        

    }
}