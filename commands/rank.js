const { command } = require('../utils')
const inWindow = []

module.exports = class Rank extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['top']
    }
    async run ({message, argsAlt}, t) {
        if(inWindow.includes(message.author.id)) return message.channel.send(t('comandos:rank.inWindow'))
        let types = ['codes', 'decoders']
        let atual = argsAlt[0] ? types.includes(argsAlt[0].toLowerCase()) ? argsAlt[0].toLowerCase() : 'codes' : 'codes'
        let genEmbed = async(type) => {
            let minutos = parseInt(((Date.now() - this.client.dataRanks.get('lastUpdate'))/1000)/60)
            let num = 1
            atual = type
            let embed = new this.client.Discord.RichEmbed()
                .setTitle(`Rank ${await this.client.firstUpperLetter(type)}: Shard[${(this.client.shard.id + 1)}/${(this.client.shard.count)}]`)
                .setDescription(this.client.dataRanks.get(type).map(user => `(**${num++}**) **${user.user.tag}** - \`${user.count}\``).slice(0, 10).join('\n'))
                .setTimestamp(new Date())
                .setFooter(t('comandos:rank.footer', { position: (this.client.dataRanks.get(type).indexOf(this.client.dataRanks.get(type).find(user => user.user.id === message.author.id)) + 1), lastUpdate: minutos }), message.author.displayAvatarURL)
                .setColor(5289)
            return embed;
        }
        message.channel.send(await genEmbed(atual)).then(async msg => {
            await msg.react('©')
            await msg.react('🎛')
            await msg.react('❌')
            inWindow.push(message.author.id)
            const codes = msg.createReactionCollector((r, u) => r.emoji.name === "©" && u.id === message.author.id, { time: 60000 });
            const decoders = msg.createReactionCollector((r, u) => r.emoji.name === "🎛" && u.id === message.author.id, { time: 60000 });
            const finalizar = msg.createReactionCollector((r, u) => r.emoji.name === "❌" && u.id === message.author.id, { time: 60000 });
            let force = false
            codes.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                if(atual === 'codes') return;
                msg.edit(await genEmbed('codes')).catch(e => {})
            })
            decoders.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                if(atual === 'decoders') return;
                msg.edit(await genEmbed('decoders')).catch(e => {})
            })
            finalizar.on('collect', async r => {
                force = true
                inWindow.splice(inWindow.indexOf(message.author.id), 1)
                msg.delete().catch(e => {})
                message.delete().catch(e => {})
                codes.emit('end')
                decoders.emit('end')
                finalizar.emit('end')
            })
            finalizar.on('end', async r => {
                if(force) return;
                msg.delete().catch(e => {})
                message.delete().catch(e => {})
                inWindow.splice(inWindow.indexOf(message.author.id), 1)
            })
        })
    }
}