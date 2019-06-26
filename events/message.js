const roleSetDelay = new Set(),
    mentionDelay = new Set(),
    sugestDelay = new Set(),
    usersCMDColdown = [];
module.exports = async function (message) {
    if (message.channel.type === 'dm' || message.author.bot) return;
    let args = message.content.split(' ').slice(1),
        argsAlt = message.content.split(' ').slice(1).filter(arg => arg !== ''),
        setFixedT = translate => t = translate,
        usuario = await this.docDB({type: 1, content: message.author}),
        servidor = await this.docDB({type: 2, content: message.guild}),
        language = (servidor && servidor.lang) || 'pt-BR';
    setFixedT(this.i18next.getFixedT(language))
    this.i18next.use(this.translationBackend).init({
        ns: ['comandos', 'eventos', 'help'],
        preload: await this.fs.readdirSync('./locales'),
        fallbackLng: 'pt-BR',
        backend: {
            loadPath: `./locales/{{lng}}/{{ns}}.json`
        },
        interpolation: {
            escapeValue: false
        },
        returnEmptyString: false
    }, async (e, f) => {
        if(!f) return;
        if(usuario.banned.get('ban')) return;
        if (message.content.startsWith(servidor.prefix) && message.content !== servidor.prefix) {
            let command = message.content.slice(servidor.prefix.length).trim().split(' ')[0].toLowerCase()
            if(args[0] === command) {
                args.splice(1)
            }
            if(argsAlt[0] === command) {
                argsAlt.splice(1)
            }
            try {
                let prefix = servidor.prefix,
                    commandRun = this.commands.find(c => c.name === command || c.aliases.includes(command) || c.aliases.includes(`$HIDE${command}`));
                if (commandRun) {
                    if(servidor.allowedChannels.length === 0 || !servidor.allowedChannels.includes(message.channel.id) || (await this.verPerm(['MANAGE_MESSAGES', 'owner', 'subowner', 'developer', 'supervisor', 'designer'], false, usuario))) {
                        let cmdColdown;
                        if(usersCMDColdown.find(user => user.id === message.author.id)) {
                            cmdColdown = await usersCMDColdown.find(user => user.id === message.author.id)
                        } else {
                            await usersCMDColdown.push({ id: message.author.id, coldown: '0000000000000' })
                            cmdColdown = await usersCMDColdown.find(user => user.id === message.author.id)
                        }
                        let tempoPassado = Date.now() - parseInt(cmdColdown.coldown),
                            tempoRestante = (parseInt(cmdColdown.coldown) + 3000) - (tempoPassado + parseInt(cmdColdown.coldown)),
                            segundos = parseInt(tempoRestante/3000),
                            milesimos = tempoRestante - (segundos*3000);
                        if (tempoPassado > 3000) {
                            let cmdDB = await this.docDB({ id: commandRun.name, type: 3 })
                            if(!cmdDB.maintenance || (await this.verPerm(['owner', 'subowner', 'developer', 'operator', 'supervisor', 'designer'], false, usuario))) {
                                commandRun.process({message, args, argsAlt, prefix, usuario, servidor}, t, setFixedT)
                                usersCMDColdown.find(user => user.id === message.author.id).coldown = Date.now()
                                let random = Math.round(Math.random() * 1000)
                                if(servidor.config.get('vipMessages') && (random >= 500 && random <= 550 && !usuario.vip)) {
                                    message.channel.send(t('eventos:voteInBPD', { member: message.member }))
                                }
                            } else {
                                message.channel.send(t('eventos:cmdInManu', { cmd: command })).then(msg => {
                                    msg.delete(7000).catch(e => {})
                                    message.delete(7000).catch(e => {})
                                })
                            }
                        } else {
                            message.channel.send(t('eventos:cmdCooldown', { member: message.member, seconds: segundos, thousandth: milesimos })).then(msg => {
                                msg.delete(7000).catch(e => {})
                                message.delete(7000).catch(e => {})
                            })
                        }
                    } else {
                        message.channel.send(t('eventos:channelBlocked', { member: message.member })).then(msg => {
                            msg.delete(7000).catch(e => {})
                            message.delete(7000).catch(e => {})
                        })
                    }
                }
            } catch(err) {
                if (err.code !== 'MODULE_NOT_FOUND') {
                    console.log(err.code)
                    console.error(err)
                }
            }
        }

        if(!mentionDelay.has(message.author.id) && (message.content.includes(`<@${this.user.id}>`) || message.content.includes(`<@!${this.user.id}>`))) {
            mentionDelay.add(message.author.id)
            setTimeout(function() {
                mentionDelay.delete(message.author.id)
            }, 10 * 1000)
            message.channel.send(t('eventos:mentionBot', { member: message.member, prefix: servidor.prefix }))
        }

        if(servidor.sugest.get('on')) {
            if(message.channel.id === servidor.sugest.get('channel') && servidor.sugest.get('type') === 2 && message.author.id !== this.user.id) {
                if(!sugestDelay.has(message.author.id) || servidor.sugest.get('coldown') === 0) {
                    if(servidor.sugest.get('coldown') !== 0) {
                        sugestDelay.add(message.author.id)
                        setTimeout(function() {
                            sugestDelay.delete(message.author.id)
                        }, servidor.sugest.get('coldown'))
                    }
                    await message.react('✅').catch(e => {})
                    await message.react('❌').catch(e => {})
                } else {
                    message.delete(700).catch(e => {})
                    message.channel.send(t('eventos:sugestDelay', { member: message.member, time: this.ms(servidor.sugest.get('coldown')) })).then(async msg => {
                        msg.delete(servidor.sugest.get('coldown'))
                    })
                }
            }
        }

    })
}