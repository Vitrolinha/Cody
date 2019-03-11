const { command } = require('../utils')

module.exports = class Sugest extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['sugerir', 'sugestao']
    }
    async run ({message, args, servidor}, t) {
        if(!servidor.sugest.get('on')) return message.channel.send(t('comandos:sugest.sistemOff'))
        if(servidor.sugest.get('type') !== 1) return message.channel.send(t('comandos:sugest.noTypeChannel', { channel: servidor.sugest.get('channel') }))
        let canal = await message.guild.channels.get(servidor.sugest.get('channel'))
        if(!canal) return emssage.channel.send(t('comandos:sugest.channelNotFound'))
        if(!args[0]) return message.channel.send(t('comandos:sugest.noArgs'))
        let embed = new this.client.Discord.RichEmbed()
            .setTitle(t('comandos:sugest.title'))
            .setDescription(args.slice(1).join(' '))
            .setTimestamp(new Date())
            .setFooter(`${message.author.username} (ID: ${message.author.id})`, message.author.displayAvatarURL)
            .setColor(2631906)
        canal.send(embed).then(async msg => {
            await msg.react('✅')
            await msg.react('❌') 
        })
        message.channel.send(t('comandos:sugest.sended'))
    }
}