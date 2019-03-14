const { command } = require('../utils')
const inWindowSugest = []

module.exports = class Config extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['configurar']
    }
    async run ({message, args, prefix, usuario, servidor}, t) {
        if(!(await this.client.verPerm(['MANAGE_GUILD', 'owner', 'subowner', 'operator'], message.member, usuario))) return message.channel.send(t('comandos:config.noPermission'));
        let configs = ['prefix', 'vipmessages', 'sugest']
        let embed = new this.client.Discord.RichEmbed()
            .addField(t('comandos:config.howToUse'), `\`\`\`${configs.map(config => `${prefix}config ${config}`).join('\n')}\`\`\``)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        if(!args[0]) return message.channel.send(embed);
        if(!configs.includes(args[0].toLowerCase())) message.channel.send(embed)
        let config = args[0].toLowerCase()
        if(config === 'prefix') {
            if(!args[1]) return message.channel.send(t('comandos:config.prefix.noArgs'))
            let newPrefix = args[1]
            if(newPrefix.length > 4) return message.channel.send(t('comandos:config.prefix.bigPrefix'))
            servidor.prefix = newPrefix
            servidor.save()
            message.channel.send(t('comandos:config.prefix.defined', { prefix: newPrefix }))
        } else if(config === 'vipmessages') {
            let oVip = servidor.config.get('vipMessages') ? false : true
            servidor.config.set('vipMessages', oVip)
            servidor.save()
            let msg = oVip ? t('comandos:config.vipMessages.defined') : t('comandos:config.vipMessages.removed')
            message.channel.send(msg)
        } else if(config === 'sugest') {
            if(inWindowSugest.includes(message.author.id + message.channel.id)) return message.channel.send(t('comandos:config.sugest.inWindow'))
            let actions = ['on', 'off']
            let sugest = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:config.sugest.howToUse'))
                .setDescription(`\`\`\`${prefix}config sugest <${actions.join('/')}>\`\`\``)
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            if(!args[1]) return message.channel.send(sugest);
            if(!actions.includes(args[1].toLowerCase())) return message.channel.send(sugest);
            let action = args[1].toLowerCase()
            if(action === 'on') {
                let selectType = new this.client.Discord.RichEmbed()
                    .setTitle(t('comandos:config.sugest.title'))
                    .setDescription(t('comandos:config.sugest.description', { prefix: prefix }))
                    .setTimestamp(new Date())
                    .setFooter(message.author.username, message.author.displayAvatarURL)
                    .setColor(5289)
                let msgType = await message.channel.send(selectType)
                inWindowSugest.push(message.author.id + message.channel.id)
                message.channel.awaitMessages(mensagem => mensagem.author.id === message.author.id && mensagem.content === '1' || mensagem.content === '2' || mensagem.content === 'cancel', {
                    maxMatches: 1,
                    time: 60000,
                    errors: ['time']
                }).then(async selectedType => {
                    if(selectedType.first().content !== 'cancel') {
                        let type = parseInt(selectedType.first().content)
                        let msgChannel = await message.channel.send(t('comandos:config.sugest.mentionChannel'))
                        message.channel.awaitMessages(mensagem => mensagem.author.id === message.author.id, {
                            maxMatches: 1,
                            time: 60000,
                            errors: ['time']
                        }).then(async selectedChannel => {
                            if(selectedChannel.first().content !== 'cancel') {
                                let canal = selectedChannel.first().mentions.channels.first() ? selectedChannel.first().mentions.channels.first() : selectedChannel.first().guild.channels.get(selectedChannel.first().content) ? selectedChannel.first().guild.channels.get(selectedChannel.first().content) : selectedChannel.first().guild.channels.find(channel => channel.name.toLowerCase() === selectedChannel.first().content.toLowerCase()) ? selectedChannel.first().guild.channels.find(channel => channel.name.toLowerCase() === selectedChannel.first().content.toLowerCase()) : message.channel
                                servidor.sugest = { on: true, channel: canal.id, type: type}
                                servidor.save()
                                if(type === 1) {
                                    message.channel.send(t('comandos:config.sugest.defined1', { channel: canal, member: message.member, prefix: prefix }))
                                } else if(type === 2) {
                                    message.channel.send(t('comandos:config.sugest.defined2', { channel: canal, member: message.member, prefix: prefix }))
                                }
                                inWindowSugest.splice(inWindowSugest.indexOf(message.author.id + message.channel.id), 1)
                            } else {
                                msgChannel.delete().catch(e => {})
                                inWindowSugest.splice(inWindowSugest.indexOf(message.author.id + message.channel.id), 1)
                                message.channel.send(t('comandos:config.sugest.canceled', { member: message.member }))
                            }
                        }).catch(err => {
                            msgChannel.delete().catch(e => {})
                            inWindowSugest.splice(inWindowSugest.indexOf(message.author.id + message.channel.id), 1)
                            message.channel.send(t('comandos:config.sugest.timeout', { member: message.member }))
                        })
                    } else {
                        msgType.delete().catch(e => {})
                        inWindowSugest.splice(inWindowSugest.indexOf(message.author.id + message.channel.id), 1)
                        message.channel.send(t('comandos:config.sugest.canceled', { member: message.member }))
                    }
                }).catch(err => {
                    msgType.delete().catch(e => {})
                    inWindowSugest.splice(inWindowSugest.indexOf(message.author.id + message.channel.id), 1)
                    message.channel.send(t('comandos:config.sugest.timeout', { member: message.member }))
                })
            } else if(action === 'off') {
                if(!servidor.sugest.get('on')) return message.channel.send(t('comandos:config.sugest.alreadyOff'))
                servidor.sugest = { on: false, channel: 'None', type: 0}
                servidor.save()
                message.channel.send(t('comandos:config.sugest.disabled'))
            }
        }
    }
}