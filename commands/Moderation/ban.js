const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['banir']
    }
    async run ({message, argsAlt, usuario}, t) {
        if(!await this.client.verPerm(['BAN_MEMBERS', 'owner', 'subowner', 'operator'], message.member, usuario)) return message.channel.send(t('comandos:ban.noPermission'));
        if(!message.guild.me.hasPermission(['BAN_MEMBERS'])) return message.channel.send(t('comandos:ban.noBotPermBan'));
        if(!argsAlt[0]) return message.channel.send(t('comandos:ban.noArgs'));
        let member = message.mentions.members.first() ? message.mentions.members.first() : message.guild.members.get(argsAlt[0]) ? message.guild.members.get(argsAlt[0]) : message.guild.members.find(user => user.user.username === argsAlt[0]) ? message.guild.members.find(user => user.user.username === argsAlt[0]) : message.guild.members.find(user => user.user.tag === argsAlt[0]) ? message.guild.members.find(user => user.user.tag === argsAlt[0]) : false
        if(!member) return message.channel.send(t('comandos:ban.noArgs'));
        if(message.member.highestRole.position <= member.highestRole.position && message.guild.owner.id !== message.author.id) return message.channel.send(t('comandos:ban.topRole'))
        if(!member.bannable) return message.channel.send(t('comandos:ban.notBannable'));
        let motivo = argsAlt[1] ? argsAlt.slice(1).join(' ') : t('comandos:ban.notReason')
        await member.ban(motivo)
        message.channel.send(t('comandos:ban.banned', { author: message.member, member: member.user.tag }))
    }
}