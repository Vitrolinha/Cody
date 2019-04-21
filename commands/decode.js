const { command } = require('../utils')

module.exports = class Decode extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['decoder' ,'decodificar']
    }
    async run ({message, usuario}, t) {
        let total = Date.now() - (Math.floor(usuario.economy.get('damaged')).lastDamaged + Math.floor(usuario.economy.get('damaged').time))
        let horas = Math.floor(total/60/60)
        let minutos = Math.floor(total/60-horas*60)
        if(usuario.economy.get('damaged').on) return message.channel.send(t('comandos:decode.damaged', { member: message.member, hours: horas, minutes: minutos }));
        let minutes = parseInt(((1800000 - (Date.now() - usuario.economy.get('lastDecode')))/1000)/60)
        if(parseInt(((Date.now() - usuario.economy.get('lastDecode'))/1800000)) === 0) return message.channel.send(t('comandos:decode.nothingToCollect', { member: message.member, codes: (usuario.economy.get('decoders') * 1000), time: minutes }));
        let codes = usuario.economy.get('lastDecode') === '0000000000000' ? usuario.economy.get('decoders') * 1000 : parseInt(((Date.now() - usuario.economy.get('lastDecode'))/1000)/30) * usuario.economy.get('decoders')
        let bonus = usuario.vip ? codes/2 : 0
        usuario.economy.set('codes', (codes + bonus))
        usuario.economy.set('lastDecode', (Date.now()).toString())
        usuario.save()
        let embed = new this.client.Discord.RichEmbed()
            .setTitle(t('comandos:decode.decoded'))
            .setDescription(t('comandos:decode.codes', { codes: codes, bonus: bonus }))
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        message.channel.send(embed)
    }
}