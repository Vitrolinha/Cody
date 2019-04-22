const { command } = require('../utils')
const inWindow = []

module.exports = class Shop extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['loja']
    }
    async run ({message, args, prefix, usuario}, t) {
        if(inWindow.includes(message.author.id)) return message.channel.send(t('comandos:shop.inWindow'))
        let produtos = [{
            name: t('comandos:shop.products.decoder'),
            price: 150000,
            count: 1,
            num: 1
        }]
        let totalPages = parseInt(produtos.length/10)
        let pagina = 1
        let genEmbed = async (cnt) => {
            let productsMap = produtos.map(produto => `${produto.num} - **${produto.name}** \`${Number(produto.price).toLocaleString()} codes\``).slice((cnt.page*10)-10,cnt.page*10).join('\n')
            let embed = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:shop.menu.title'))
                .setDescription(t('comandos:shop.menu.desc', { prefix: prefix, products: productsMap }))
                .setThumbnail(this.client.user.displayAvatarURL)
                .setTimestamp(new Date())
                .setFooter(t('comandos:shop.menu.footer', { page: cnt.page, total: totalPages + 1 }))
                .setColor(5289)
            return embed;
        }
        if(!args[0]) {
            message.channel.send(await genEmbed({page: pagina})).then(async msg => {
                if(totalPages === 0) return;
                await msg.react('⬅')
                await msg.react('➡')
                await msg.react('<:cancel:570000123594014730>')
                var force = false
                const anterior = msg.createReactionCollector((r, u) => r.emoji.name === "⬅" && u.id === message.author.id, { time: 60000 });
                const proxima = msg.createReactionCollector((r, u) => r.emoji.name === "➡" && u.id === message.author.id, { time: 60000 });
                const finalizar = msg.createReactionCollector((r, u) => r.emoji.name === "<:cancel:570000123594014730>" && u.id === message.author.id, { time: 60000 });
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
        } else {
            if(!produtos.find(produto => produto.num === parseInt(args.join(' ')))) return message.channel.send(t('comandos:shop.productDoesNotExist'))
            let produto = await produtos.find(produto => produto.num === parseInt(args.join(' ')))
            let purchased = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:shop.purchased.title'))
                .setDescription(`${produto.count} **${produto.name}** \`${Number(produto.price).toLocaleString()} codes\``)
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            if(produto.num === 1) {
                if(produto.price > usuario.economy.get('codes')) return message.channel.send(t('comandos:shop.insufficientCodes', { member: message.member, codes: Number(produto.price - usuario.economy.get('codes')).toLocaleString() }))
                usuario.economy.set('codes', (usuario.economy.get('codes') - produto.price))
                usuario.economy.set('decoders', (usuario.economy.get('decoders') + 1))
                usuario.save()
                message.channel.send(purchased)
            }
        }
    }
}