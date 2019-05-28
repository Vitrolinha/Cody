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
        if(argsAlt[0] && argsAlt[0].toLowerCase() === 'warn') {
            let onf = usuario.vip.get('warns') ? false : true
            usuario.vip.set('warns', onf)
            usuario.save()
            let msg = onf ? t('comandos:vip.warnon') : t('comandos:vip.warnoff')
            message.channel.send(msg)
        } else if(userDB) {
            let total = Math.floor(((userDB.vip.get('time') + 172800000) - Date.now())/1000)
            let horas = Math.floor(total/60/60)
            let tmp = Math.floor(total/60)
            let minutos = Math.floor(total/60-horas*60)
            let segundos = Math.floor(total-(tmp*60))
            let timeView = `${(horas < 10 ? '0' + horas : horas)}:${(minutos < 10 ? '0' + minutos : minutos)}:${(segundos < 10 ? '0' + segundos : segundos)}`
            let inicio = new this.client.Discord.RichEmbed()
                .setTitle(`${user.username}:`)
                .setDescription(t('comandos:vip.descStart', { userPoints: userDB.vip.get('votePoints'), guildPoints: servidor.votePoints, vip: (userDB.vip.get('on') ? timeView : t('comandos:vip.vipOff')) }))
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            message.channel.send(inicio).then(async msg => {
                await msg.react(':votePoint:582973181711613962')
                await msg.react(':interrogation:571032834287075352')
                await msg.react('❌')
                
            })
        } else {
            message.channel.send(t('comandos:vip.noUserDB'))
            this.client.newDocDB({
                id: user.id,
                type: 1,
                content: user
            })
        }
    }
}