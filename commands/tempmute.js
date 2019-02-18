const { command } = require('../utils')

module.exports = class TempMute extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['mutetemp', 'timemute']
    }
    async run ({message, args, usuario, servidor}) {
        var roleName = '🔇Cody Mute'
        if(!await this.client.verPerm(['MANAGE_ROLES_OR_PERMISSIONS', 'owner', 'subowner', 'operator'], message.member, usuario)) return message.channel.send(t('comandos:tempmute.noPermission'));
        if(!message.guild.me.hasPermission(['MANAGE_ROLES_OR_PERMISSIONS'])) return message.channel.send(t('comandos:tempmute.noPermBot'))
        if(!args[0]) return message.channel.send(t('comandos:tempmute.noMention'));
        var member = message.mentions.members.first() ? message.mentions.members.first() : message.guild.members.get(args[0]) ? message.guild.members.get(args[0]) : message.guild.members.find(user => user.user.username === args[0]) ? message.guild.members.find(user => user.user.username === args[0]) : message.guild.members.find(user => user.user.tag === args[0]) ? message.guild.members.find(user => user.user.tag === args[0]) : false
        if(!member) return message.channel.send(t('comandos:tempmute.noMention'));
        if(message.guild.roles.find(role => role.name === roleName)) {
            var role = await message.guild.roles.find(role => role.name === roleName)
            if(!member.roles.get(role.id)) {
                if(message.member.highestRole.position <= role.position && message.guild.owner.id !== message.author.id) return message.channel.send(t('comandos:tempmute.topRole', { role: roleName }))
                if(message.guild.me.highestRole.position <= role.position) return message.channel.send(t('comandos:tempmute.topRole', { role: roleName }))
                if(!args[1]) return message.channel.send(t('comandos:tempmute.noTime'))
                var time = this.client.ms(args.slice(1).join(' '))
                if(!time) return message.channel.send(t('comandos:tempmute.notATime', { time: time }))
                await member.addRole(role.id)
                if(!servidor.muteds.find(muted => muted.id === member.id)) {
                    servidor.muteds.push({ id: member.id, temp: true, date: Date.now(), time: time })
                    servidor.save()
                } else {
                    servidor.muteds.find(muted => muted.id === member.id).time = time
                    servidor.muteds.find(muted => muted.id === member.id).date = Date.now()
                    servidor.temp = true
                    servidor.save()
                }
                message.channel.send(t('comandos:tempmute.tempmuted', { member: member, author: message.member, time: this.client.moment(Date.now() + time).format('lll') }))
            } else {
                if(servidor.muteds.find(muted => muted.id === member.id)) {
                    servidor.muteds.splice(servidor.muteds.indexOf(servidor.muteds.find(muted => muted.id === member.id)), 1)
                    servidor.save()
                }
                await member.removeRole(role.id)
                message.channel.send(t('comandos:tempmute.unmuted', { member: member, author: message.member }))
            }
        } else {
            var role = await message.guild.createRole({name: roleName, permissions: 0})
            message.guild.channels.filter(channel => channel.permissionsFor(this.client.user.id).has('MANAGE_ROLES_OR_PERMISSIONS')).forEach(async channel => {
                channel.overwritePermissions(role, {SEND_MESSAGES: false, CONNECT: false, SPEAK: false})
            })
            message.channel.send(t('comandos:tempmute.useAgain', { role: roleName }))
        }
    }
}