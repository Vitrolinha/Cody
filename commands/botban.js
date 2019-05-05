const { command } = require('../utils')

module.exports = class BotBan extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['bban']
    }
    async run ({message, argsAlt, usuario, servidor, prefix}) {
        if(!(await this.client.verPerm(['owner', 'subowner', 'operator', 'developer', 'supervisor'], false, usuario))) return message.channel.send(t('comandos:botban.noPermission'));
        let invalid = new this.client.Discord.RichEmbed()
            .addField(t('comandos:botban.howToUse'), t('comandos:botban.howDesc', { prefix: prefix }), false)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        this.client.moment.locale(servidor.lang)
        if(!argsAlt[0]) return message.channel.send(invalid)
        if(!message.mentions.users.first()) return message.channel.send(invalid)
        if(argsAlt[0].replace('!', '') !== message.mentions.users.first().toString()) return message.channel.send(invalid)
        let mencionado = message.mentions.users.first()
        let time = argsAlt.slice(1).join(' ')
        if(mencionado.id === message.author.id) return message.channel.send(t('comandos:botban.iMentioned'));
        if(mencionado.bot) return message.channel.send(t('comandos:botban.botMention'))
        this.client.database.Users.findOne({'_id': mencionado.id}).then(async mencionadoDB => {
            if(mencionadoDB) {
                if(await this.client.verPerm(['owner', 'subowner', 'operator', 'developer', 'supervisor', 'designer'], false, mencionadoDB)) return message.channel.send(t('comandos:botban.mentionedStaff'));
                if(!mencionadoDB.banned.get('ban')) {
                    if(!argsAlt[1]) {
                        mencionadoDB.banned.set('ban', true)
                        mencionadoDB.save()
                        message.channel.send(t('comandos:botban.bannedNoTime', { member: mencionado }))
                    } else {
                        mencionadoDB.banned.set('ban', true)
                        mencionadoDB.banned.set('tempban', true)
                        mencionadoDB.banned.set('time', Date.now() + this.client.ms(time))
                        mencionadoDB.save()
                        message.channel.send(t('comandos:botban.bannedTime', { member: mencionado, time: this.client.moment(Date.now() + this.client.ms(time)).format('lll') }))
                    }
                } else {
                    mencionadoDB.banned.set('ban', false)
                    mencionadoDB.banned.set('tempban', false)
                    mencionadoDB.banned.set('time', 0)
                    mencionadoDB.save()
                    message.channel.send(t('comandos:botban.unbanned', { member: mencionado }))
                }
            } else {
                message.channel.send(t('comandos:botban.noUserDB'));
                this.client.newDocDB({
                    id: mencionado.id,
                    type: 1,
                    content: mencionado
                })
            }
        })
    }
}