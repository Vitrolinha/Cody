const { command } = require('../utils')

module.exports = class Decode extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['code']
    }
    async run ({message, usuario}, t) {
        let userDB = message.mentions.users.first() ? this.client.Users.findOne({'_id': message.mentions.users.first().id}) ? this.client.Users.findOne({'_id': message.mentions.users.first().id}) : usuario : usuario
        let embed = new this.client.Discord.RichEmbed()
            .setTitle(`${this.client.users.get(userDB._id).username}:`)
            .setDescription(t('comandos:codes.desc', { codes: Number(userDB.economy.get('codes')).toLocaleString(), decoders: Number(userDB.economy.get('decoders')).toLocaleString() }))
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        message.channel.send(embed)
    }
}