const { command } = require('../utils')
const inWindow = []

module.exports = class Lock extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['discriminator', 'discriminador']
    }
    async run ({message, args}) {
        if(inWindow.includes(message.author.id)) return message.channel.send(t('comandos:discrim.inWindow'))
        if(!args[0]) return message.channel.send(t('comandos:discrim.noArgs'))
        let discrim = args[0].replace('#', '')
        if(discrim.length !== 4) return message.channel.send(t('comandos:discrim.discrimLength'))
        if(isNaN(discrim)) return message.channel.send(t('comandos:discrim.isNaN'))
        let founds = this.client.users.filter(user => user.discriminator === discrim)
        if(founds.size === 0) return message.channel.send(t('comandos:discrim.notFound', { discrim: discrim }))
        let totalPages = parseInt(founds.size/25)
        let pagina = 1
        let genEmbed = async (cnt) => {
            let embed = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:discrim.title', { shard: this.client.shard.id + 1, totalShard: this.client.shard.count, count: founds.size }))
                .setDescription(`\`${founds.map(found => found.tag).slice((cnt.page*25)-25,cnt.page*25).join('` **|** `')}\``)
                .setTimestamp(new Date())
                .setFooter(t('comandos:discrim.footer', { page: cnt.page, total: totalPages + 1 }))
                .setColor(5289)
            return embed;
        }
        message.channel.send(await genEmbed({page: pagina})).then(async msg => {
            if(totalPages === 0) return;
            await msg.react('⬅')
            await msg.react('➡')
            await msg.react('570000123594014730')
            var force = false
            const anterior = msg.createReactionCollector((r, u) => r.emoji.name === "⬅" && u.id === message.author.id, { time: 60000 });
            const proxima = msg.createReactionCollector((r, u) => r.emoji.name === "➡" && u.id === message.author.id, { time: 60000 });
            const finalizar = msg.createReactionCollector((r, u) => r.emoji.name === "570000123594014730" && u.id === message.author.id, { time: 60000 });
            inWindow.push(message.author.id)
            anterior.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                if(pagina === 1) {
                    pagina = totalPages + 1
                    msg.edit(await genEmbed({page: pagina}))
                } else {
                    pagina -= 1
                    msg.edit(await genEmbed({page: pagina}))
                }
            })
            proxima.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                if(pagina === (totalPages + 1)) {
                    pagina = 1
                    msg.edit(await genEmbed({page: pagina}))
                } else {
                    pagina += 1
                    msg.edit(await genEmbed({page: pagina}))
                }
            })
            finalizar.on('collect', async r => {
                force = true
                msg.delete().catch(e => {})
                message.delete().catch(e => {})
                anterior.emit('end')
                proxima.emit('end')
                finalizar.emit('end')
            })
            finalizar.on('end', async r => {
                inWindow.splice(inWindow.indexOf(message.author.id), 1)
                msg.delete().catch(e => {})
                message.delete().catch(e => {})
                if(force) return;
                anterior.emit('end')
                proxima.emit('end')
                finalizar.emit('end')
            })
        })
    }
}