const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['decoder' ,'decodificar']
    }
    async run ({message, usuario}, t) {
        let total = Date.now() - (Math.floor(usuario.economy.get('damaged')).lastDamaged + Math.floor(usuario.economy.get('damaged').time)),
            horas = Math.floor(total/60/60),
            minutos = Math.floor(total/60-horas*60);
        if(usuario.economy.get('damaged').on) return message.channel.send(t('comandos:decode.damaged', { member: message.member, hours: horas, minutes: minutos }));
        let coldown = usuario.altBought.includes('processor') ? 900000 : 1800000
        let minutes = parseInt(((coldown - (Date.now() - usuario.economy.get('lastDecode')))/1000)/60)
        if(parseInt(((Date.now() - usuario.economy.get('lastDecode'))/coldown)) === 0) return message.channel.send(t('comandos:decode.nothingToCollect', { member: message.member, codes: Number(usuario.economy.get('decoders') * 1000).toLocaleString(), time: minutes }));
        let codes = parseInt(usuario.economy.get('lastDecode')) === 0 ? usuario.economy.get('decoders') * 1000 : (parseInt((Date.now() - usuario.economy.get('lastDecode'))/coldown) * (usuario.economy.get('decoders') * 1000))
        if(codes >= (usuario.economy.get('decoders') * 25000)) {
            codes = usuario.economy.get('decoders') * 25000
        }
        let bonus = usuario.vip.get('on') ? codes/2 : 0,
            restante = parseInt(usuario.economy.get('lastDecode')) === Date.now() ? 0 : parseInt(parseInt((Date.now() - usuario.economy.get('lastDecode'))/coldown)*coldown);
        usuario.economy.set('codes', (usuario.economy.get('codes') + codes + bonus))
        usuario.economy.set('lastDecode', (parseInt(usuario.economy.get('lastDecode')) + restante).toString())
        usuario.economy.set('warned', false)
        usuario.save()
        let embed = new this.client.Discord.RichEmbed()
            .setTitle(t('comandos:decode.decoded'))
            .setDescription(t('comandos:decode.codes', { codes: Number(codes).toLocaleString(), bonus: Number(bonus).toLocaleString() }))
            .setTimestamp(new Date())
            .setFooter(t('comandos:decode.footer', { codes: Number(usuario.economy.get('codes')).toLocaleString() }), message.author.displayAvatarURL)
            .setColor(5289)
        message.channel.send(embed)
    }
}