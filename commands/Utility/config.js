const { command } = require('../../utils'),
    inWindowCmdChannel = [],
    inWindowSugest = [];

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['configurar']
    }
    async run ({message, argsAlt, prefix, usuario, servidor}, t) {
        if(!await this.client.verPerm(['MANAGE_GUILD', 'owner', 'subowner', 'operator'], message.member, usuario)) return message.channel.send(t('comandos:config.noPermission'));
        let configs = ['prefix', 'vipmessages', 'cmdchannel', 'sugest']
        let embed = new this.client.Discord.RichEmbed()
            .addField(t('comandos:config.howToUse'), t('comandos:config.howDesc', { prefix: prefix }))
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        if(!argsAlt[0]) return message.channel.send(embed);
        if(!configs.includes(argsAlt[0].toLowerCase())) message.channel.send(embed)
        let config = argsAlt[0].toLowerCase()
        if(config === 'prefix') {
            if(!argsAlt[1]) return message.channel.send(t('comandos:config.prefix.noArgs'))
            let newPrefix = argsAlt[1]
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
        } else if (config === 'cmdchannel') {
            let actions = ['add', 'del', 'reset']
            let cmdChannelEmbed = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:config.cmdChannel.howToUse'))
                .setDescription(t('comandos:config.cmdChannel.howDesc', { prefix: prefix }))
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            if(!argsAlt[1]) return message.channel.send(cmdChannelEmbed);
            if(!actions.includes(argsAlt[1].toLowerCase())) return message.channel.send(cmdChannelEmbed);
            if(inWindowCmdChannel.includes(message.author.id + message.channel.id)) return message.channel.send(t('comandos:config.cmdChannel.inWindow'))
            let action = argsAlt[1].toLowerCase()
            let genEmbed = async(doc) => {
                let allowedChannels = doc.allowedChannels
                let deniedChannels = message.guild.channels.filter(channel => !allowedChannels.includes(channel.id) && channel.type === 'text').map(channel => channel.id)
                allowedChannels.filter(channel => !message.guild.channels.get(channel)).forEach(channel => {
                    doc.allowedChannels.splice(channel)
                })
                let allowMap = allowedChannels.map(channel => `**${message.guild.channels.get(channel).name}**`).join(', ')
                let denyMap = deniedChannels.map(channel => `**${message.guild.channels.get(channel).name}**`).join(', ')
                let sucess = new this.client.Discord.RichEmbed()
                    .setTitle(t('comandos:config.cmdChannel.sucess'))
                    .addField(t('comandos:config.cmdChannel.allowed'), allowedChannels.length === 0 ? t('comandos:config.cmdChannel.emptyAlloweds') : allowMap.length >= 600 ? t('comandos:config.cmdChannel.manyChannels') : allowMap)
                    .addField(t('comandos:config.cmdChannel.denied'), deniedChannels.length === 0 ? t('comandos:config.cmdChannel.emptyDenieds') : denyMap.length >= 600 ? t('comandos:config.cmdChannel.manyChannels') : denyMap)
                    .setTimestamp(new Date())
                    .setFooter(message.author.username, message.author.displayAvatarURL)
                    .setColor(5289)
                return sucess;
            }
            if(action === 'add') {
                if(!argsAlt[2] || !message.mentions.channels.first()) return message.channel.send(t('comandos:config.cmdChannel.add.noMention'))
                let mentions = []
                await message.mentions.channels.forEach(mention => mentions.push(mention))
                await mentions.filter(mention => !servidor.allowedChannels.includes(mention.id) && mention.type === 'text').forEach(mention => { servidor.allowedChannels.push(mention.id) })
                message.channel.send(await genEmbed(servidor))
                servidor.save()
            } else if(action === 'del') {
                if(!argsAlt[2] || !message.mentions.channels.first()) return message.channel.send(t('comandos:config.cmdChannel.del.noMention'))
                let mentions = []
                await message.mentions.channels.forEach(mention => mentions.push(mention))
                if(servidor.allowedChannels.length === 0) {
                    await message.guild.channels.filter(channel => mentions.find(mention => mention.id !== channel.id) && channel.type === 'text').forEach(channel => servidor.allowedChannels.push(channel.id))
                    message.channel.send(await genEmbed(servidor))
                    servidor.save()
                } else {
                    await mentions.filter(mention => servidor.allowedChannels.includes(mention.id) && mention.type === 'text').forEach(mention => { servidor.allowedChannels.splice(servidor.allowedChannels.indexOf(mention.id), 1) })
                    message.channel.send(await genEmbed(servidor))
                    servidor.save()
                }
            } else if(action === 'reset') {
                servidor.allowedChannels = []
                servidor.save()
                message.channel.send(t('comandos:config.cmdChannel.reseted'))
            }
        } else if(config === 'sugest') {
            if(inWindowSugest.includes(message.author.id + message.channel.id)) return message.channel.send(t('comandos:config.sugest.inWindow'))
            let actions = ['on', 'off', 'coldown']
            let sugest = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:config.sugest.howToUse'))
                .setDescription(t('comandos:config.sugest.howDesc', { prefix: prefix }))
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            if(!argsAlt[1]) return message.channel.send(sugest);
            if(!actions.includes(argsAlt[1].toLowerCase())) return message.channel.send(sugest);
            let action = argsAlt[1].toLowerCase()
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
            } else if (action === 'coldown') {
                if(!servidor.sugest.get('on')) return message.channel.send(t('comandos:config.sugest.systemOff'))
                if(!argsAlt[2]) return message.channel.send(sugest);
                if(argsAlt[2] === 'off') {
                    if(servidor.sugest.get('coldown') === 0) return message.channel.send(t('comandos:config.sugest.coldown.alreadyOff'))
                    servidor.sugest.set('coldown', 0)
                    servidor.save()
                    message.channel.send(t('comandos:config.sugest.coldown.reset', { member: message.member }))
                } else {
                    let time = argsAlt.splice(2).join(' ')
                    let timeMS = this.client.ms(time)
                    if(timeMS > 7200000) return message.channel.send(t('comandos:config.sugest.coldown.timeLimit', { member: message.member }))
                    servidor.sugest.set('coldown', timeMS)
                    servidor.save()
                    message.channel.send(t('comandos:config.sugest.coldown.defined', { member: message.member, time: time }))
                }
            }
        }
    }
}