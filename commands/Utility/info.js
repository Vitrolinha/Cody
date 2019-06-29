const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['information']
    }
    async run ({message, args}, t) {
            let links = [{
                name: 'convite',
                link: `https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=2146958847`
            }, {
                name: 'servidor',
                link: 'https://discord.gg/5Xt3uHF'
            }, {
                name: 'bots para discord',
                link: 'https://botsparadiscord.xyz/bots/507292506942210048/votar'
            }]
            let guildsSize = await this.client.shardsValue('guilds.size')
            let channelsSize = await this.client.shardsValue('channels.size')
            let usersSize = await this.client.shardsValue('users.size')
            let total = Math.floor(this.client.uptime/1000)
            let horas = Math.floor(total/60/60)
            let tmp = Math.floor(total/60)
            let minutos = Math.floor(total/60-horas*60)
            let segundos = Math.floor(total-(tmp*60))
            let embed = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:info.title'))
                .setDescription(t('comandos:info.description', { myFounder: this.client.users.get('337410863545843714').tag }))
                .addField(t('comandos:info.statistics'), t('comandos:info.statisticsDesc', { ping: parseInt(this.client.ping), memory: (process.memoryUsage().heapUsed / 1024 / 1024).toString().slice(0,4), votes: this.client.totalVotes }), true)
                .addField(t('comandos:info.community'), t('comandos:info.communityDesc', { guilds: guildsSize, channels: channelsSize, users:  usersSize }), true)
                .addField(t('comandos:info.uptime'), t('comandos:info.uptimeDesc', { hours: (horas < 10 ? '0' + horas : horas), minutes: (minutos < 10 ? '0' + minutos : minutos), seconds: (segundos < 10 ? '0' + segundos : segundos) }), true)
                .addField(t('comandos:info.urls'), links.map(link => link ? `- **[${link.name.toUpperCase()}](${link.link})**` : '- __**EM BREVE**__').join('\n'), true)
                .setThumbnail(this.client.user.displayAvatarURL)
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            message.channel.send(t('comandos:info.cntMessage'), embed)
    }
}