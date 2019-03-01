const { command } = require('../utils')

module.exports = class Config extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['configurar']
    }
    async run ({message, args, prefix, usuario, servidor}, t) {
        if(!(await this.client.verPerm(['MANAGE_GUILD', 'owner', 'subowner', 'operator'], message.member, usuario))) return message.channel.send(t('comandos:config.noPermission'));
        let configs = ['prefix', 'vipmessages']
        if(args[0] && configs.includes(args[0].toLowerCase())) {
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
            }
        } else {
            let embed = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:config.howToUse'))
                .setDescription(`\`\`\`${prefix}config prefix <new-prefix>\n${prefix}config vipMessages\`\`\``)
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(2631906)
            message.channel.send(embed)
        }
    }
}