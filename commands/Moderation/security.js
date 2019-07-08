const { command } = require('../../utils'),
    jsonC = require('../../locales/pt-BR/comandos.json'),
    inWindow = [];

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['defense', '$HIDEsafety', 'segurança', '$HIDEseguranca', 'defesa']
    }
    async run ({message, argsAlt, prefix, usuario, servidor}, t) {
        if(!await this.client.verPerm(['ADMINISTRATOR', 'owner', 'subowner', 'operator'], message.member, usuario)) return message.channel.send(t('comandos:security.noPermission'));
        let protections = Object.keys(jsonC.security.options),
            onlyLever = ['botEntry', 'inviteLink'],
            page = 1,
            totalPages = parseInt(protections.length/4)+1,
            menuEmbed = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:security.menu.title'))
                .setDescription(t('comandos:security.menu.desc', { prefix: prefix }))
                .setTimestamp(new Date())
                .setColor(5289),
            goMenu = async(pag) => {
                menuEmbed.fields = []
                await protections.slice((pag*4)-4, pag*4).forEach(async protection => {
                    let activated = servidor.security.find(protect => protect.name === protection) ? '<:enabled:597418277794480128>' : '<:disabled:597418212350492682>'
                    await menuEmbed.addField(`**${protection} ${activated}**`, t(`comandos:security.options.${protection}`))
                })
                menuEmbed.setFooter(t('comandos:security.menu.footer', { page: pag, total: totalPages }))
                return menuEmbed
            };
        if(!argsAlt[0] || !protections.map(protection => protection.toLowerCase()).includes(argsAlt[0].toLowerCase())) return message.channel.send(await goMenu(page)).then(async menu => {
            if(inWindow.find(ar => ar.split(' ')[0] === message.author.id)) {
                let usr = inWindow.find(ar => ar.split(' ')[0] === message.author.id).split(' ')
                message.channel.messages.get(usr[1]).delete().catch(e => {})
                inWindow.splice(inWindow.indexOf(inWindow.find(ar => ar.split(' ')[0] === message.author.id)), 1)
            }
            const collector = menu.createReactionCollector((r, u) => (r.emoji.name === '⬅' || r.emoji.name === '➡' || r.emoji.name === '❌') && u.id === message.author.id, { time: 60000 });
            inWindow.push(`${message.author.id} ${menu.id}`)
            await menu.react('⬅').catch(e => {})
            await menu.react('➡').catch(e => {})
            await menu.react('❌').catch(e => {})
            collector.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                switch (r.emoji.name) {
                    case '⬅':
                        if(page === 1) {
                            page = totalPages
                            menu.edit(await goMenu(page))
                        } else {
                            page -= 1
                            menu.edit(await goMenu(page))
                        }
                        break;
                    case '➡': 
                        if(page === (totalPages)) {
                            page = 1
                            menu.edit(await goMenu(page))
                        } else {
                            page += 1
                            menu.edit(await goMenu(page))
                        }
                        break;
                    case '❌':
                        collector.emit('end')
                        break;
                }
            })
            collector.on('end', async r => {
                menu.delete().catch(e => {})
                message.delete().catch(e => {})
                inWindow.splice(inWindow.indexOf(inWindow.find(ar => ar.split(' ')[0] === message.author.id)), 1)
            })
        })
        let protection = argsAlt[0].toLowerCase()
        if(onlyLever.map(on => on.toLowerCase()).includes(protection)) {
            let found = servidor.security.find(sec => sec.name.toLowerCase() === protection),
                active = argsAlt[1] ? argsAlt[1].toLowerCase() === 'on' ? true : argsAlt[1].toLowerCase() === 'off' ? false : found ? false : true : found ? false : true;
            console.log(found)
            if(argsAlt[1] && argsAlt[1] === 'on' && found) return message.channel.send(t('comandos:security.alreadyOn', { member: message.member, protection: found.name }))
            if(argsAlt[1] && argsAlt[1] === 'off' && !found) return message.channel.send(t('comandos:security.alreadyOff', { member: message.member, protection: onlyLever.find(lev => lev.toLowerCase() === protection) }))
            if(active) { servidor.security.push({name: onlyLever.find(lev => lev.toLowerCase() === protection)}) } else { servidor.security.splice(found, 1) }
            servidor.save()
            console.log(found)
            let msg = active ? t('comandos:security.enabled', { member: message.member, protection: onlyLever.find(lev => lev.toLowerCase() === protection) }) : t('comandos:security.disabled', { member: message.member, protection: found.name })
            message.channel.send(msg)
        }
        
    }
}