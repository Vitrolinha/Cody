const { command } = require('../utils')

module.exports = class Lock extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['discriminator']
    }
    async run ({message, args}) {
        if(!args[0]) return message.channel.send(t('comandos:discrim.noArgs'))
        let discrim = args[0].replace('#')
        if(discrim.length > 4) return message.channel.send(t('comandos:discrim.discrimLength'))
        if(isNaN(discrim)) return message.channel.send(t('comandos:discrim.isNaN'))
        let founds = this.client.users.filter(user => user.discriminator == discrim)
        if(founds.size === 0) return message.channel.send(t('comandos:discrim.notFound', { discrim: discrim }))
        let totalPages = parseInt(founds.size/25)
        let pagina = 1
        let genEmbed = async (cnt) => {
            let embed = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:discrim.title', { shard: this.client.shard.id + 1, totalShard: this.client.shard.count, count: founds.size }))
                .setDescription(`\`${founds.map(found => found.tag).slice((cnt.page*25)-25,cnt.page*25).join('` **|** `')}\``)
                .setTimestamp(new Date())
                .setFooter(t('comandos:discrim.footer', { page: cnt.page, total: totalPages + 1 }))
            return embed;
        }
        message.channel.send(await genEmbed({page: pagina})).then(async msg => {
            if(totalPages === 0) return;
            await msg.react('⬅')
            await msg.react('➡')
        })
    }
}