const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
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
            .setDescription(args.join(' '))
            .setTimestamp(new Date())
            .setFooter(`${message.author.username} (ID: ${message.author.id})`, message.author.displayAvatarURL)
            .setColor(5289)
        canal.send(embed).then(async msg => {
            await msg.react('✅')
            await msg.react('❌') 
        })
        message.channel.send(t('comandos:sugest.sended'))
    }
}