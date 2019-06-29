const { command } = require('../../utils'),
  inWindow = [];

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['h', 'ajuda', 'comandos', 'commands']
    }
    async run ({message, argsAlt, prefix}, t) {
        let comandos = []
        let commands = this.client.commands.array()
        let maintenanceCommands = await this.client.database.Commands.find({'maintenance': true})
        commands.forEach(commandArr => {
          comandos.push({
            name: commandArr.name,
            desc: t(`help:${commandArr.name}.desc`),
            aliases: commandArr.aliases.filter(aliase => !aliase.startsWith('$HIDE')),
            category: maintenanceCommands.find(cmd => cmd._id === commandArr.name) ? 0 : parseInt(t(`help:${commandArr.name}.category`))
          })
        })
        let commandAlt = argsAlt[0] ? this.client.commands.find(c => c.name === argsAlt[0] || c.aliases.includes(argsAlt[0].replace('$HIDE', ''))) : false
        if(commandAlt && t(`help:${commandAlt.name.toLowerCase()}.desc`) !== `${commandAlt.name.toLowerCase()}.desc`) {
          let cmdName = commandAlt.name.toLowerCase()
          let embed = new this.client.Discord.RichEmbed()
            .setTitle(`🖇 ${await this.client.firstUpperLetter(cmdName)}:`)
            .setDescription(t(`help:${cmdName}.desc`))
            .addField(t('comandos:help.howToUse'), '```a\n' + t(`help:${cmdName}.howToUse`, { prefix: prefix }) + '```')
            .addField(t('comandos:help.aliases'), comandos.filter(command => command.name === cmdName)[0].aliases.length > 0 ? '```' + comandos.filter(command => command.name === cmdName)[0].aliases.filter(aliase => !aliase.startsWith('$HIDE')).map(aliase => prefix + aliase).join('\n') + '```' : t('comandos:help.notHaveAliases'))
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
            .addField(t('comandos:help.fun', { count: comandos.filter(cmd => cmd.category === 4).length }), `\`${comandos.filter(cmd => cmd.category === 4).map(cmd => cmd.name).join('`, `')}\``)
            .setThumbnail(this.client.user.displayAvatarURL)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
          if(comandos.filter(cmd => cmd.category === 0).length !== 0) {
            menu.addField(t('comandos:help.maintenance', { count: comandos.filter(cmd => cmd.category === 0).length }), `\`${comandos.filter(cmd => cmd.category === 0).map(cmd => cmd.name).join('`, `')}\``)
          }
          if(inWindow.includes(message.author.id + message.channel.id)) return message.channel.send(t('comandos:help.inWindow'))
          inWindow.push(message.author.id + message.channel.id)
          message.channel.send(t('comandos:help.cntMessageNoArg'), menu).then(async msg => {
            try {
              await msg.react('🔦')
              await msg.react('⚒')
              await msg.react('💰')
              await msg.react('😜')
              if(comandos.filter(cmd => cmd.category === 0).length !== 0) {
                await msg.react('⚠')
              }
              await msg.react('↩')
              await msg.react('❌')
              const finalizar = msg.createReactionCollector((r, u) => r.emoji.name === "❌" && u.id === message.author.id, { time: 120000 });
              const utilities = msg.createReactionCollector((r, u) => r.emoji.name === "🔦" && u.id === message.author.id, { time: 120000 });
              const moderation = msg.createReactionCollector((r, u) => r.emoji.name === "⚒" && u.id === message.author.id, { time: 120000 });
              const economy = msg.createReactionCollector((r, u) => r.emoji.name === "💰" && u.id === message.author.id, { time: 120000 });
              const fun = msg.createReactionCollector((r, u) => r.emoji.name === "😜" && u.id === message.author.id, { time: 120000 });
              const maintenance = msg.createReactionCollector((r, u) => r.emoji.name === "⚠" && u.id === message.author.id, { time: 120000 });
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
              fun.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                embed.setTitle(t(`comandos:help.economy`, { count: comandos.filter(cmd => cmd.category === 4).length }))
                embed.setDescription(comandos.filter(cmd => cmd.category === 4).map(cmd => `**${cmd.name}** - ${cmd.desc.toLowerCase()}`).join('\n'))
                msg.edit(embed)
              })
              maintenance.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                embed.setTitle(t(`comandos:help.maintenance`, { count: comandos.filter(cmd => cmd.category === 0).length }))
                embed.setDescription(comandos.filter(cmd => cmd.category === 0).map(cmd => `**${cmd.name}** - ${cmd.desc.toLowerCase()}`).join('\n'))
                msg.edit(embed)
              })
              finalizar.on('collect', async r => {
                msg.delete().catch(e => {})
                message.delete().catch(e => {})
                inWindow.splice(inWindow.indexOf(message.author.id + message.channel.id), 1)
              })
              voltar.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                msg.edit(menu)
              })
              finalizar.on('end', async r => {
                msg.delete().catch(e => {})
                message.delete().catch(e => {})
                inWindow.splice(inWindow.indexOf(message.author.id + message.channel.id), 1)
              })
            } catch(e) {}
          })
        }
    }
}