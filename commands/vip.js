const { command } = require('../utils')

module.exports = class TempMute extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['vote', 'votes', 'votar', 'voto']
    }
    async run ({message, argsAlt, prefix, usuario, servidor}) {
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
            let embed = new this.client.Discord.RichEmbed()
                .setTitle(`${user.username}:`)
                .setDescription(t('comandos:vip.descStart', { userPoints: userDB.vip.get('votePoints'), guildPoints: servidor.votePoints, vip: (userDB.vip.get('on') ? timeView : t('comandos:vip.vipOff')) }))
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            message.channel.send(embed).then(async msg => {
                await msg.react(':votePoint:582973181711613962')
                await msg.react(':interrogation:571032834287075352')
                await msg.react('↩')
                await msg.react('❌')
                const vantages = msg.createReactionCollector((r, u) => r.emoji.id === '582973181711613962' && u.id === message.author.id, { time: 60000 });
                const support = msg.createReactionCollector((r, u) => r.emoji.id === '571032834287075352' && u.id === message.author.id, { time: 60000 });
                const back = msg.createReactionCollector((r, u) => r.emoji.name === '↩' && u.id === message.author.id, { time: 60000 });
                const finalizar = msg.createReactionCollector((r, u) => r.emoji.name === '❌' && u.id === message.author.id, { time: 60000 });
                vantages.on('collect', async r => {
                    r.remove(r.users.last().id).catch(e => {})
                    embed.setTitle(t('comandos:vip.vantages.title'))
                    embed.setDescription(t('comandos:vip.vantages.desc'))
                    msg.edit(embed)
                })
                support.on('collect', async r => {
                    r.remove(r.users.last().id).catch(e => {})
                    embed.setTitle(t('comandos:vip.support.title'))
                    embed.setDescription(t('comandos:vip.support.desc', { prefix: prefix }))
                    embed.addField(t('comandos:vip.support.field.title'), t('comandos:vip.support.field.desc'))
                    msg.edit(embed)
                })
                back.on('collect', async r => {
                    r.remove(r.users.last().id).catch(e => {})
                    embed.setTitle(`${user.username}:`)
                    embed.setDescription(t('comandos:vip.descStart', { userPoints: userDB.vip.get('votePoints'), guildPoints: servidor.votePoints, vip: (userDB.vip.get('on') ? timeView : t('comandos:vip.vipOff')) }))
                    msg.edit(embed)
                })
                finalizar.on('collect', async r => {
                    vantages.emit('end')
                    support.emit('end')
                    back.emit('end')
                    msg.delete().catch(e => {})
                    message.delete().catch(e => {})
                    finalizar.emit('end')
                })
                finalizar.on('end', async r => {
                    vantages.emit('end')
                    support.emit('end')
                    back.emit('end')
                    msg.delete().catch(e => {})
                    message.delete().catch(e => {})
                })
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