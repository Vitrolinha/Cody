const { command } = require('../utils')

module.exports = class Decode extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['decoder' ,'decodificar']
    }
    async run ({message, usuario}, t) {
        let minutes = parseInt(((1800000 - (Date.now() - usuario.economy.get('lastDecode')))/1000)/60)
        if(parseInt(((Date.now() - usuario.economy.get('lastDecode'))/1800000)) === 0) return message.channel.send(t('comandos:decode.nothingToCollect', { member: message.member, codes: (usuario.economy.get('decoders') * 1000), time: minutes }));
        let codes = usuario.economy.get('decoders') * 1000
        usuario.economy.set('codes', codes)
        usuario.economy.set('lastDecode', (Date.now()).toString())
        usuario.save()
        let embed = new this.client.Discord.RichEmbed()
            .setTitle(t('comandos:decode.decoded'))
            .setDescription(t('comandos:decode.codes', { codes: codes }))
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        message.channel.send(embed)
    }
}