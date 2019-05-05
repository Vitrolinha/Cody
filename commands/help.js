const { command } = require('../utils')
const inWindow = []

module.exports = class Help extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['h', 'ajuda', 'comandos', 'commands']
    }
    async run ({message, argsAlt, prefix}, t) {
        let comandos = []
        let files = this.client.fs.readdirSync('./commands');
        files.forEach(file => {
          comandos.push({
            name: file.split(".")[0],
            desc: t(`help:${file.split(".")[0]}.desc`),
            aliases: this.client.commands.get(file.split(".")[0]).aliases,
            category: parseInt(t(`help:${file.split(".")[0]}.category`))
          })
        })
        let commandAlt = argsAlt[0] ? this.client.commands.find(c => c.name === argsAlt[0] || c.aliases.includes(argsAlt[0])) : false
        if(commandAlt && t(`help:${commandAlt.name.toLowerCase()}.desc`) !== `${commandAlt.name.toLowerCase()}.desc`) {
          let cmdName = commandAlt.name.toLowerCase()
          let embed = new this.client.Discord.RichEmbed()
            .setTitle(`🖇 ${await this.client.firstUpperLetter(cmdName)}:`)
            .setDescription(t(`help:${cmdName}.desc`))
            .addField(t('comandos:help.howToUse'), '```a\n' + t(`help:${cmdName}.howToUse`, { prefix: prefix }) + '```')
            .addField(t('comandos:help.aliases'), comandos.filter(command => command.name === cmdName)[0].aliases.length > 0 ? '```' + comandos.filter(command => command.name === cmdName)[0].aliases.map(aliase => prefix + aliase).join('\n') + '```' : t('comandos:help.notHaveAliases'))
            .setThumbnail(this.client.user.displayAvatarURL)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
          message.channel.send(t('comandos:help.cntMessageArg', { cmd: cmdName }), embed)
        } else {
          let menu = new this.client.Discord.RichEmbed()
            .setTitle(t('comandos:help.title'))
            .setDescription(t('comandos:help.description', { prefix: prefix }))
            .addField(t('comandos:help.utilities', { count: comandos.filter(cmd => cmd.category === 1).length }), `\`${comandos.filter(cmd => cmd.category === 1).map(cmd => cmd.name).join('`, `')}\``)
            .addField(t('comandos:help.moderation', { count: comandos.filter(cmd => cmd.category === 2).length }), `\`${comandos.filter(cmd => cmd.category === 2).map(cmd => cmd.name).join('`, `')}\``)
            .addField(t('comandos:help.economy', { count: comandos.filter(cmd => cmd.category === 3).length }), `\`${comandos.filter(cmd => cmd.category === 3).map(cmd => cmd.name).join('`, `')}\``)
            .setThumbnail(this.client.user.displayAvatarURL)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
          if(inWindow.includes(message.author.id + message.channel.id)) return message.channel.send(t('comandos:help.inWindow'))
          inWindow.push(message.author.id + message.channel.id)
          message.channel.send(t('comandos:help.cntMessageNoArg'), menu).then(async msg => {
            try {
              await msg.react('🔦')
              await msg.react('⚒')
              await msg.react('💰')
              await msg.react('↩')
              await msg.react('❌')
              const finalizar = msg.createReactionCollector((r, u) => r.emoji.name === "❌" && u.id === message.author.id, { time: 120000 });
              const utilities = msg.createReactionCollector((r, u) => r.emoji.name === "🔦" && u.id === message.author.id, { time: 120000 });
              const economy = msg.createReactionCollector((r, u) => r.emoji.name === "💰" && u.id === message.author.id, { time: 120000 });
              const moderation = msg.createReactionCollector((r, u) => r.emoji.name === "⚒" && u.id === message.author.id, { time: 120000 });
              const voltar = msg.createReactionCollector((r, u) => r.emoji.name === "↩" && u.id === message.author.id, { time: 120000 });        
              let embed = new this.client.Discord.RichEmbed()
                .setThumbnail(this.client.user.displayAvatarURL)
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
              utilities.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                embed.setTitle(t(`comandos:help.utilities`, { count: comandos.filter(cmd => cmd.category === 1).length }))
                embed.setDescription(comandos.filter(cmd => cmd.category === 1).map(cmd => `**${cmd.name}** - ${cmd.desc.toLowerCase()}`).join('\n'))
                msg.edit(embed)
              })
              moderation.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                embed.setTitle(t(`comandos:help.moderation`, { count: comandos.filter(cmd => cmd.category === 2).length }))
                embed.setDescription(comandos.filter(cmd => cmd.category === 2).map(cmd => `**${cmd.name}** - ${cmd.desc.toLowerCase()}`).join('\n'))
                msg.edit(embed)
              })
              economy.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                embed.setTitle(t(`comandos:help.economy`, { count: comandos.filter(cmd => cmd.category === 3).length }))
                embed.setDescription(comandos.filter(cmd => cmd.category === 3).map(cmd => `**${cmd.name}** - ${cmd.desc.toLowerCase()}`).join('\n'))
                msg.edit(embed)
              })
              finalizar.on('collect', async r => {
                msg.delete()
                message.delete().catch(e => {})
                inWindow.splice(inWindow.indexOf(message.author.id + message.channel.id), 1)
              })
              voltar.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                msg.edit(menu)
              })
              finalizar.on('end', async r => {
                msg.delete()
                message.delete().catch(e => {})
                inWindow.splice(inWindow.indexOf(message.author.id + message.channel.id), 1)
              })
            } catch(e) {}
          })
        }
    }
}