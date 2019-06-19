const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['beval', 'bval']
    }
    async run ({message, args, argsAlt, usuario, servidor}, t) {
        if(!(await this.client.verPerm(['owner', 'subowner', 'operator'], false, usuario))) return message.channel.send(t('comandos:broadcasteval.noPermission'));
        let code = args.join(' ')
        if(!code) return message.channel.send(t('comandos:broadcasteval.noCode'));
        if(code.includes('token')) return;
        let page = 0
        let totalPages = this.client.shard.count
        let embed = new this.client.Discord.RichEmbed()
            .setThumbnail(this.client.user.displayAvatarURL)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
        try {
            let results = await this.client.shard.broadcastEval(code)
            let resultado = results[page]
            embed.addField(t('comandos:broadcasteval.code'), `\`\`\`${code}\`\`\``, false)
            embed.addField(t('comandos:broadcasteval.result'), `\`\`\`${resultado}\`\`\``, false)
            embed.setFooter(t('comandos:broadcasteval.footer', { page: (page + 1), total: totalPages }))
            embed.setColor(5289)
            message.channel.send(embed).then(async msg => {
                if(totalPages === 0) return;
                await msg.react('⬅')
                await msg.react('➡')
                await msg.react('❌')
                let force = false
                const anterior = msg.createReactionCollector((r, u) => r.emoji.name === "⬅" && u.id === message.author.id, { time: 120000 });
                const proxima = msg.createReactionCollector((r, u) => r.emoji.name === "➡" && u.id === message.author.id, { time: 120000 });
                const finalizar = msg.createReactionCollector((r, u) => r.emoji.name === "❌" && u.id === message.author.id, { time: 120000 });
                anterior.on('collect', async r => {
                    r.remove(r.users.last().id).catch(e => {})
                    if(page === 0) {
                        page = totalPages - 1
                        embed.fields[1].value = `\`\`\`${results[page]}\`\`\``
                        embed.setFooter(t('comandos:broadcasteval.footer', { page: (page + 1), total: totalPages }))
                        msg.edit(embed)
                    } else {
                        page -= 1
                        embed.fields[1].value = `\`\`\`${results[page]}\`\`\``
                        embed.setFooter(t('comandos:broadcasteval.footer', { page: (page + 1), total: totalPages }))
                        msg.edit(embed)
                    }
                })
                proxima.on('collect', async r => {
                    r.remove(r.users.last().id).catch(e => {})
                    if(page === (totalPages - 1)) {
                        page = 0
                        embed.fields[1].value = `\`\`\`${results[page]}\`\`\``
                        embed.setFooter(t('comandos:broadcasteval.footer', { page: (page + 1), total: totalPages }))
                        msg.edit(embed)
                    } else {
                        page += 1
                        embed.fields[1].value = `\`\`\`${results[page]}\`\`\``
                        embed.setFooter(t('comandos:broadcasteval.footer', { page: (page + 1), total: totalPages }))
                        msg.edit(embed)
                    }
                })
                finalizar.on('collect', async r => {
                    force = true
                    anterior.emit('end')
                    proxima.emit('end')
                    finalizar.emit('end')
                })
                finalizar.on('end', async r => {
                    if(force) return;
                    anterior.emit('end')
                    proxima.emit('end')
                    finalizar.emit('end')
                })
            })
        } catch(err) {
            embed.addField(t('comandos:broadcasteval.code'), `\`\`\`${code}\`\`\``, false)
            embed.addField(t('comandos:broadcasteval.error'), `\`\`\`${err}\`\`\``, false)
            embed.setColor(16711680)
            message.channel.send(embed)
        }
    }
}