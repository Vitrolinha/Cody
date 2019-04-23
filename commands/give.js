const { command } = require('../utils')

module.exports = class Give extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['dar', 'doar', 'pay', 'pagar']
    }
    async run ({message, usuario, prefix}, t) {
        let invalid = new this.client.Discord.RichEmbed()
            .addField(t('comandos:give.howToUse'), `\`\`\`${prefix}give <mention> <count>\`\`\``)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        if(!args[0]) return message.channel.send(invalid)
        if(!message.mentions.users.first()) return message.channel.send(invalid)
        if(args[0].replace('!', '') !== message.mentions.users.first().toString()) return message.channel.send(invalid)
        let mencionado = message.mentions.users.first()
        let mentionDB = await this.client.database.Users.findOne({'_id': mencionado.id})
        if(mentionDB) {
            if(!args[1]) return message.channel.send(invalid)
            if(isNaN(args[1])) return message.channel.send(t('comandos:give.isNaN'))
            let value = parseInt(args[1])
            if(value > usuario.economy.get('codes')) return message.channel.send(t('comandos:give.insufficientCodes', { member: message.member }))
            if(value <= 0) return message.channel.send('comandos:give.bellow0')
            usuario.economy.set('codes', (usuario.economy.set('codes') - value))
            mentionDB.economy.set('codes', (mentionDB.economy.set('codes') - value))
            usuario.save()
            mentionDB.save()
            message.channel.send(t('comandos:give.given', { member: message.member, mention: mencionado.tag, codes: Number(value).toLocaleString() }))
        } else {
            message.channel.send(t('comandos:give.noUserDB'))
            this.client.newDocDB({
                id: mencionado.id,
                type: 1,
                content: mencionado
            })
        }
    }
}