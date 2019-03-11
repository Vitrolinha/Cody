const { command } = require('../utils')

module.exports = class Lock extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['lockchannel']
    }
    async run ({message, args, usuario, servidor}) {
        if(!await this.client.verPerm(['MANAGE_CHANNELS', 'owner', 'subowner', 'operator'], message.member, usuario)) return message.channel.send(t('comandos:lock.noPermission'));
        let channel = args[0] ? message.mentions.channels.first() ? message.mentions.channels.first() : message.guild.channels.get(args[0]) ? message.guild.channels.get(args[0]) : message.guild.channels.find(channel => channel.name.toLowerCase() === args.join(' ').toLowerCase()) ? message.guild.channels.find(channel => channel.name.toLowerCase() === args.join(' ').toLowerCase()) : message.channel : message.channel
        if(!channel.permissionsFor(this.client.user.id).has('MANAGE_ROLES_OR_PERMISSIONS')) return message.channel.send(t('comandos:lock.noPermBot'));
        let role = message.guild.roles.find(role => role.name === '@everyone')
        if(!servidor.lockedChannels.includes(channel.id)) {
            channel.overwritePermissions(role, {SEND_MESSAGES: false})
            servidor.lockedChannels.push(channel.id)
            servidor.save()
            message.channel.send(t('comandos:lock.locked', { channel: channel }))
        } else {
            channel.overwritePermissions(role, {SEND_MESSAGES: true})
            servidor.lockedChannels.splice(servidor.lockedChannels.indexOf(channel.id), 1)
            servidor.save()
            message.channel.send(t('comandos:lock.unlocked', { channel: channel }))
        }
    }
}