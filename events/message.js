const roleSetDelay = new Set()
const mentionDelay = new Set()
const sugestDelay = new Set()
const usersCMDColdown = []
module.exports = async function (message) {
    if (message.channel.type === 'dm') return;
    if (message.author.bot) return;
    let args = message.content.split(' ').slice(1)
    let argsAlt = message.content.split(' ').slice(1).filter(arg => arg !== '')
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
                if (f) {
                    if(!usuario.banned.get('ban')) {
                        if (message.content.startsWith(servidor.prefix)) {
                            if(message.content === servidor.prefix) return;
                            let command = message.content.split(' ')[0].slice(servidor.prefix.length).toLowerCase()
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
                                    if(servidor.allowedChannels.length !== 0 && !servidor.allowedChannels.includes(message.channel.id) && !(await this.verPerm(['MANAGE_MESSAGES', 'owner', 'subowner', 'developer', 'supervisor', 'designer'], false, usuario))) return message.channel.send(t('eventos:channelBlocked', { member: message.member })).then(msg => msg.delete(7000));
                                    if (tempoPassado < 3000) return message.channel.send(t('eventos:cmdCooldown', { member: message.member, seconds: segundos, thousandth: milesimos }));
                                    this.database.Commands.findOne({'_id': commandRun.name}).then(async cmdDB => {
                                            if(cmdDB) {
                                                if(cmdDB.maintenance && !(await this.verPerm(['owner', 'subowner', 'developer', 'operator', 'supervisor', 'designer'], false, usuario))) return message.channel.send(t('eventos:cmdInManu', { cmd: command }))
                                                commandRun.process({message, args, argsAlt, prefix, usuario, servidor}, t, setFixedT)
                                                usersCMDColdown.find(user => user.id === message.author.id).coldown = Date.now()
                                                if(!servidor.config.get('vipMessages')) return;
                                                let random = Math.round(Math.random() * 1000)
                                                if(random >= 500 && random <= 550 && !usuario.vip) {
                                                    message.channel.send(t('eventos:voteInBPD', { member: message.member }))
                                                }
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
                            message.channel.send(t('eventos:mentionBot', { member: message.member, prefix: servidor.prefix }))
                        }

                        if(servidor.sugest.get('on')) {
                            if(message.channel.id !== servidor.sugest.get('channel')) return console.log('a');
                            if(servidor.sugest.get('type') === 2) {
                                console.log('b')
                                if(message.author.id === this.user.id) return console.log('c');
                                if(!sugestDelay.has(message.author.id)) {
                                    console.log('d')
                                    sugestDelay.add(message.author.id)
                                    setTimeout(function() {
                                        sugestDelay.delete(message.author.id)
                                    }, 13 * 1000)
                                    await message.react('✅')
                                    await message.react('❌')     
                                } else {
                                    message.delete(2000)
                                    message.channel.send(t('eventos:sugestDelay', { member: message.member })).then(async msg => {
                                        msg.delete(6000)
                                    })
                                    console.log('e')
                                }
                            }
                        }

                        if(message.guild.id === this.config.codyGuild && this.user.id !== this.config.canaryID) {
                            if(roleSetDelay.has(message.author.id)) return;
                            setTimeout(() => {
                                roleSetDelay.delete(message.author.id)
                            }, 20 * 1000)
                            let roles = [{
                                name: 'operator',
                                roleID: this.config.operatorRole
                            }, {
                                name: 'developer',
                                roleID: this.config.developerRole
                            }, {
                                name: 'supervisor',
                                roleID: this.config.supervisorRole
                            }, {
                                name: 'designer',
                                roleID: this.config.designerRole
                            }]
                            this.database.Users.findOne({'_id': message.author.id}).then(user => {
                                roles.forEach(role => {
                                    if(user.cargos.get(role.name) && !message.member.roles.get(role.roleID)) {
                                        message.member.addRole(role.roleID)
                                    } else if(message.member.roles.get(role.roleID) && !user.cargos.get(role.name)) {
                                        message.member.removeRole(role.roleID)
                                    }
                                })
                                if(user.vip.get('on') && !message.member.roles.get(this.config.vipRole)) {
                                    message.member.addRole(this.config.vipRole)
                                } else if(message.member.roles.get(this.config.vipRole) && !user.vip.get('on')) {
                                    message.member.removeRole(this.config.vipRole)
                                }
                            })
                        }
                    } else {
                        if(!usuario.banned.get('tempban')) return;
                        if(Date.now() >= parseInt(usuario.banned.get('time'))) {
                            usuario.banned.set('ban', false)
                            usuario.banned.set('tempban', false)
                            usuario.banned.set('time', 0)
                            usuario.save()
                            message.channel.send(t('eventos:unbanned', { member: message.member }))
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