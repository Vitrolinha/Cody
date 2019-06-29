const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['code']
    }
    async run ({message, argsAlt, usuario}, t) {
        let reg = argsAlt[0] ? argsAlt[0].replace(/[^0-9]/g, '') : message.author.id,
            user = message.guild.members.get(reg) ? message.guild.members.get(reg).user : message.author;
        if(user.bot) return message.channel.send(t('comandos:codes.mentionBot', { member: message.member }))
        let userDB = await this.client.docDB({type: 1, content: user})
        if(argsAlt[0] && argsAlt[0].toLowerCase() === 'warn') {
            let onf = usuario.economy.get('warns') ? false : true
            usuario.economy.set('warns', onf)
            usuario.save()
            let msg = onf ? t('comandos:codes.warnon') : t('comandos:codes.warnoff')
            message.channel.send(msg)
        } else {
            let coldown = usuario.altBought.includes('processor') ? 900000 : 1800000
            let codes = parseInt(userDB.economy.get('lastDecode')) === 0 ? userDB.economy.get('decoders') * 1000 : (parseInt((Date.now() - userDB.economy.get('lastDecode'))/coldown) * (userDB.economy.get('decoders') * 1000))
            if(codes >= (userDB.economy.get('decoders') * 25000)) {
                codes = userDB.economy.get('decoders') * 25000
            }
            let embed = new this.client.Discord.RichEmbed()
                .setTitle(`${user.username}:`)
                .setDescription(t('comandos:codes.desc', { codes: Number(userDB.economy.get('codes')).toLocaleString(), decoders: Number(userDB.economy.get('decoders')).toLocaleString(), decodersLimit: (userDB.economy.get('capacitors') * 25), capacitors: userDB.economy.get('capacitors'), toCollect: Number(codes).toLocaleString(), total: Number(userDB.economy.get('decoders') * 25000).toLocaleString(), percentage: parseInt((codes/(userDB.economy.get('decoders') * 25000))*100) }))
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            message.channel.send(embed)
        }
    }
}