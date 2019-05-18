const mentionDelay = new Set()
const usersCMDColdown = []
module.exports = async function (message) {
    if (message.channel.type === 'dm') return;
    if (message.author.bot) return;
    let args = message.content.split(' ').slice(1)
    const setFixedT = function(translate) {
        t = translate
    }

    let usuario = await this.database.Users.findOne({'_id': message.author.id})
    let servidor = await this.database.Guilds.findOne({'_id': message.guild.id})

    if(usuario && servidor) {
        const language = (servidor && servidor.lang) || 'pt-BR'
        setFixedT(this.i18next.getFixedT(language))
        return new Promise(async (resolve, reject) => {
    
            this.i18next.use(this.translationBackend).init({
                ns: ['comandos', 'eventos', 'help'],
                preload: await this.fs.readdirSync('./assets/locales'),
                fallbackLng: 'pt-BR',
                backend: {
                    loadPath: `./assets/locales/{{lng}}/{{ns}}.json`
                },
                interpolation: {
                    escapeValue: false
                },
                returnEmptyString: false
            }, async (e, f) => {
                if (f) {
                    if(!usuario.banned.get('ban')) {
                        if (message.content.startsWith(servidor.prefix)) {
                            if(message.content === servidor.prefix) return;
                            let command = message.content.split(' ')[0].slice(servidor.prefix.length)
                            try {
                                let cmdColdown;
                                if(usersCMDColdown.find(user => user.id === message.author.id)) {
                                    cmdColdown = await usersCMDColdown.find(user => user.id === message.author.id)
                                } else {
                                    await usersCMDColdown.push({ id: message.author.id, coldown: '0000000000000' })
                                    cmdColdown = await usersCMDColdown.find(user => user.id === message.author.id)
                                }
                                let prefix = servidor.prefix
                                let tempoPassado = Date.now() - parseInt(cmdColdown.coldown)
                                let tempoRestante = (parseInt(cmdColdown.coldown) + 3000) - (tempoPassado + parseInt(cmdColdown.coldown))
                                let segundos = parseInt(tempoRestante/3000)
                                let milesimos = tempoRestante - (segundos*3000)
                                let commandRun = this.commands.find(c => c.name === command || c.aliases.includes(command))
                                if (commandRun) {
                                    if (tempoPassado < 3000) return message.channel.send(t('eventos:cmdCooldown', { member: message.author.tag, seconds: segundos, thousandth: milesimos }));
                                    this.database.Commands.findOne({'_id': commandRun.name}).then(async cmdDB => {
                                            if(cmdDB) {
                                                if(cmdDB.maintenance) return message.channel.send(t('eventos:cmdInManu', { cmd: command, member: message.author.tag }))
                                                
                                                commandRun.process({message, args, prefix, usuario, servidor}, t, setFixedT)
                                                usersCMDColdown.find(user => user.id === message.author.id).coldown = Date.now()
                                            } else {
                                                this.newDocDB({ id: commandRun.name, type: 3 })
                                                message.channel.send(t('eventos:noCmdDB', { cmd: command }))
                                            }
                                    })
                                }
                            } catch (err) {
                                if (err.code === 'MODULE_NOT_FOUND') return;
                                console.log(err.code)
                                console.error(err)
                            }
                        }

                        if(!mentionDelay.has(message.author.id) && (message.content.includes(`<@${this.user.id}>`) || message.content.includes(`<@!${this.user.id}>`))) {
                            mentionDelay.add(message.author.id)
                            setTimeout(function() {
                                mentionDelay.delete(message.author.id)
                            }, 10 * 1000)
                            message.channel.send(t('eventos:mentionBot', { member: message.author.tag, prefix: servidor.prefix }))
                        }
                    } else {
                        if(!usuario.banned.get('tempban')) return;
                        if(Date.now() >= parseInt(usuario.banned.get('time'))) {
                            usuario.banned.set('ban', false)
                            usuario.banned.set('tempban', false)
                            usuario.banned.set('time', 0)
                            usuario.save()
                            message.channel.send(t('eventos:unbanned', { member: message.author.tag }))
                        }
                    }
                } else {
                    console.log('n existe lol')
                }
            })
        })
    } else {
        if (!servidor) {
            this.newDocDB({
                id: message.guild.id,
                type: 2,
                content: message.guild
            })
        }
        if (!usuario) {
            this.newDocDB({
                id: message.author.id,
                type: 1,
                content: message.author
            })
        }
    }
}