const { command } = require('../../utils'),
    inWindow = [];

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['language', 'idioma', 'langs', 'linguagem']
    }
    async run ({message, servidor, usuario}, t , setFixedT) {
        if(!await this.client.verPerm(['MANAGE_GUILD', 'owner', 'subowner', 'operator', 'developer', 'supervisor'], message.member, usuario)) return message.channel.send(t('comandos:lang.noPermission'));
        if(!message.channel.permissionsFor(this.client.user.id).has('ADD_REACTIONS')) return message.channel.send(t('comandos:lang.noPermBot'))
        if(inWindow.includes(message.author.id)) return message.channel.send(t('comandos:lang.inWindow'))
        inWindow.push(message.author.id)
        let langs = [{name: 'pt-BR', emoji: '🇧🇷'}, { name: 'en-US', emoji: '🇺🇸' }]
        let embed = new this.client.Discord.RichEmbed()
            .setTitle(t('comandos:lang.title'))
            .setDescription(`${t('comandos:lang.desc', { error: t('comandos:staff.notHaveErrors') })}\n\n${langs.map(lang => `${lang.emoji} **${lang.name}**`).join('  ')}`)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        message.channel.send(embed).then(async msg => {
            await msg.react('🇧🇷')
            await msg.react('🇺🇸')
            await msg.react('❌')
            const ptBR = msg.createReactionCollector((r, u) => r.emoji.name === "🇧🇷" && u.id === message.author.id, { time: 60000 });
            const enUS = msg.createReactionCollector((r, u) => r.emoji.name === "🇺🇸" && u.id === message.author.id, { time: 60000 });
            const finalizar = msg.createReactionCollector((r, u) => r.emoji.name === "❌" && u.id === message.author.id, { time: 60000 });
            let force = false
            ptBR.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                if(servidor.lang === 'pt-BR') {
                    embed.setDescription(`${t('comandos:lang.desc', { error: t('comandos:lang.currentLanguage') })}\n\n${langs.map(lang => `${lang.emoji} **${lang.name}**`).join('  ')}`)
                    msg.edit(embed)
                } else {
                    msg.delete()
                    servidor.lang = 'pt-BR'
                    servidor.save()
                    setFixedT(this.client.i18next.getFixedT((servidor && servidor.lang) || 'pt-BR'))
                    message.channel.send(t('comandos:lang.defined', { lang: 'pt-BR' }))
                    finalizar.emit('end')
                }
            })
            enUS.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                if(servidor.lang === 'en-US') {
                    embed.setDescription(`${t('comandos:lang.desc', { error: t('comandos:lang.currentLanguage') })}\n\n${langs.map(lang => `${lang.emoji} **${lang.name}**`).join('  ')}`)
                    msg.edit(embed)
                } else {
                    msg.delete()
                    servidor.lang = 'en-US'
                    servidor.save()
                    setFixedT(this.client.i18next.getFixedT((servidor && servidor.lang) || 'pt-BR'))
                    message.channel.send(t('comandos:lang.defined', { lang: 'en-US' }))
                    finalizar.emit('end')
                }
            })
            finalizar.on('collect', async r => {
                force = true
                inWindow.splice(inWindow.indexOf(message.author.id), 1)
                msg.delete().catch(e => {})
                message.delete().catch(e => {})
                ptBR.emit('end')
                enUS.emit('end')
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