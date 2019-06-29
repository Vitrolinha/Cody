const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['mutar', 'silenciar']
    }
    async run ({message, args, usuario, servidor}, t) {
        let roleName = '🔇Cody Mute'
        if(!await this.client.verPerm(['MANAGE_ROLES_OR_PERMISSIONS', 'owner', 'subowner', 'operator'], message.member, usuario)) return message.channel.send(t('comandos:mute.noPermission'));
        if(!message.guild.me.hasPermission(['MANAGE_ROLES_OR_PERMISSIONS'])) return message.channel.send(t('comandos:mute.noPermBot'))
        if(!args[0]) return message.channel.send(t('comandos:mute.noArgs'));
        let member = message.mentions.members.first() ? message.mentions.members.first() : message.guild.members.get(args[0]) ? message.guild.members.get(args[0]) : message.guild.members.find(user => user.user.username === args[0]) ? message.guild.members.find(user => user.user.username === args[0]) : message.guild.members.find(user => user.user.tag === args[0]) ? message.guild.members.find(user => user.user.tag === args[0]) : false
        if(!member) return message.channel.send(t('comandos:mute.noArgs'));
        if(message.guild.roles.find(role => role.name === roleName)) {
            let role = await message.guild.roles.find(role => role.name === roleName)
            if(!member.roles.get(role.id)) {
                if(message.member.highestRole.position <= role.position && message.guild.me.highestRole.position <= role.position && message.guild.owner.id !== message.author.id) return message.channel.send(t('comandos:mute.topRole', { role: roleName }))
                await member.addRole(role.id)
                if(!servidor.muteds.find(muted => muted.id === member.id)) {
                    servidor.muteds.push({ id: member.id, temp: false, date: '0000000000000', time: '0000000000000' })
                    servidor.save()
                }
                message.channel.send(t('comandos:mute.muted', { member: member, author: message.member }))
            } else {
                if(servidor.muteds.find(muted => muted.id === member.id)) {
                    servidor.muteds.splice(servidor.muteds.indexOf(servidor.muteds.find(muted => muted.id === member.id)), 1)
                    servidor.save()
                }
                await member.removeRole(role.id)
                message.channel.send(t('comandos:mute.unmuted', { member: member, author: message.member }))
            }
        } else {
            let role = await message.guild.createRole({name: roleName, permissions: 0})
            message.guild.channels.filter(channel => channel.permissionsFor(this.client.user.id).has('MANAGE_ROLES_OR_PERMISSIONS')).forEach(async channel => {
                channel.overwritePermissions(role, {SEND_MESSAGES: false})
            })
            message.channel.send(t('comandos:mute.useAgain', { role: roleName }))
        }
    }
}