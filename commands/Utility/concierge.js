const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['portaria']
    }
    async run ({message, args, usuario, servidor, prefix}, t) {
        if(!(await this.client.verPerm(['MANAGE_GUILD', 'owner', 'subowner', 'operator'], message.member, usuario))) return message.channel.send(t('comandos:concierge.noPermission'));
        let invalid = new this.client.Discord.RichEmbed()
            .addField(t('comandos:concierge.howToUse'), t('comandos:concierge.howDesc', { prefix: prefix }))
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        if(!args[0]) return message.channel.send(invalid);
        if(args[0] !== 'welcome' && args[0] !== 'byebye' && args[0] !== 'parameters') return message.channel.send(t('comandos:concierge.invalidAct', { act: args[0].toLowerCase() }));
        let action = args[0].toLowerCase()
        if(!args[1] && action !== "parameters") return message.channel.send(t('comandos:concierge.noFunction'));
        if(action !== 'parameters' && args[1] !== 'set' && args[1] !== 'del') return message.channel.send(t('comandos:concierge.invalidFunction', { function: args[1].toLowerCase() }))
        if(action === 'welcome') {
            let funcao = args[1].toLowerCase()
            let ath = servidor.concierge.get(action)
            if(funcao === 'set') {
                if(!args[2]) return message.channel.send(t('comandos:concierge.noMsg'));
                let msg = args.splice(2).join(' ')
                if(!ath.on) {
                    ath.on = true
                }
                ath.message = msg
                ath.channel = message.channel.id
                servidor.save()
                message.channel.send(t('comandos:concierge.definedWelcome', { msg: msg }))
            } else {
                if(!ath.on) return message.channel.send(t('comandos:concierge.welcomeNotDefined'))
                ath.message = 'None'
                ath.channel = 'None'
                ath.on = false
                servidor.save()
                message.channel.send(t('comandos:concierge.removedWelcome'))
            }
        } else if(action === 'byebye') {
            let funcao = args[1].toLowerCase()
            let ath = servidor.concierge.get(action)
            if(funcao === 'set') {
                if(!args[2]) return message.channel.send(t('comandos:conciere.noMsg'));
                let msg = args.splice(2).join(' ')
                if(!ath.on) {
                    ath.on = true
                }
                ath.message = msg
                ath.channel = message.channel.id
                servidor.save()
                message.channel.send(t('comandos:concierge.definedByebye', { msg: msg }))
            } else {
                if(!ath.on) return message.channel.send(t('comandos:concierge.byebyeNotDefined'))
                ath.message = 'None'
                ath.channel = 'None'
                ath.on = false
                servidor.save()
                message.channel.send(t('comandos:concierge.removedByebye'))
            }
        } else if(action === 'parameters') {
            let parameters = new this.client.Discord.RichEmbed()
                .addField(t('comandos:concierge.parametersTo'), t('comandos:concierge.parameters'))
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            message.channel.send(parameters)
        }
    }
}