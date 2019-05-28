const { command } = require('../utils')

module.exports = class Give extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['dar', 'doar', 'pay', 'pagar']
    }
    async run ({message, argsAlt, usuario, prefix}, t) {
        let invalid = new this.client.Discord.RichEmbed()
            .addField(t('comandos:give.howToUse'), t('comandos:give.howDesc', { prefix: prefix }))
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        if(!argsAlt[0]) return message.channel.send(invalid)
        if(!message.mentions.users.first()) return message.channel.send(invalid)
        if(argsAlt[0].replace('!', '') !== message.mentions.users.first().toString()) return message.channel.send(invalid)
        let mencionado = message.mentions.users.first()
        if(mencionado.id === message.author.id) return message.channel.send(t('comandos:give.mentionYou', { member: message.member }))
        let mentionDB = await this.client.database.Users.findOne({'_id': mencionado.id})
        if(mentionDB) {
            if(!argsAlt[1]) return message.channel.send(invalid)
            if(isNaN(argsAlt[1])) return message.channel.send(t('comandos:give.isNaN'))
            let value = parseInt(argsAlt[1])
            if(value > usuario.economy.get('codes')) return message.channel.send(t('comandos:give.insufficientCodes', { member: message.member }))
            if(value <= 0) return message.channel.send(t('comandos:give.bellow0'))
            usuario.economy.set('codes', (parseInt(usuario.economy.get('codes')) - value))
            mentionDB.economy.set('codes', (parseInt(mentionDB.economy.get('codes')) + value))
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