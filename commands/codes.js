const { command } = require('../utils')

module.exports = class Decode extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['code']
    }
    async run ({message}, t) {
        let user = message.mentions.users.first() ? message.mentions.users.first() : message.author
        let userDB = await this.client.Users.findOne({'_id': user.id})
        if(userDB) {
            let embed = new this.client.Discord.RichEmbed()
                .setTitle(`${user.username}:`)
                .setDescription(t('comandos:codes.desc', { codes: Number(userDB.economy.get('codes')).toLocaleString(), decoders: Number(userDB.economy.get('decoders')).toLocaleString() }))
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            message.channel.send(embed)
        } else {
            message.channel.send(t('comandos:codes.noUserDB'))
            this.newDocDB({
                id: user.id,
                type: 1,
                content: user
            })
        }
    }
}