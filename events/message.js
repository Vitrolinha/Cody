const roleSetDelay = new Set()
const vipDelay = new Set()
const mentionDelay = new Set()
const tempMuteDelay = new Set()
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
                            let command = message.content.split(' ')[0].slice(servidor.prefix.length)
                            try {
                                let prefix = servidor.prefix
                                let tempoPassado = Date.now() - parseInt(usuario.cmdcoldown)
                                let tempoRestante = (parseInt(usuario.cmdcoldown) + 3000) - (tempoPassado + parseInt(usuario.cmdcoldown))
                                let segundos = parseInt(tempoRestante/1000)
                                let milesimos = tempoRestante - (segundos*1000)
                                let commandRun = this.commands.find(c => c.name === command || c.aliases.includes(command))
                                if (commandRun) {
                                    if (tempoPassado < 3000) return message.channel.send(t('eventos:cmdCooldown', { member: message.member, seconds: segundos, thousandth: milesimos }));
                                    usuario.cmdcoldown = Date.now()
                                    usuario.save();
                                    this.database.Commands.findOne({'_id': commandRun.name}).then(async cmdDB => {
                                            if(cmdDB) {
                                                if(cmdDB.maintenance && !(await this.verPerm(['owner', 'subowner', 'developer', 'supervisor', 'designer'], false, usuario))) return message.channel.send(t('eventos:cmdInManu', { cmd: command }))
                                                commandRun.process({message, args, prefix, usuario, servidor}, t, setFixedT)
                                                if(!servidor.config.get('vipMessages')) return;
                                                let random = Math.round(Math.random() * 1000)
                                                if(random >= 500 && random <= 550 && !usuario.vip) {
                                                    message.channel.send(t('eventos:voteInDBL', { member: message.member }))
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

                        if(!tempMuteDelay.has(message.author.id)) {
                            tempMuteDelay.add(message.author.id)
                            setTimeout(function() {
                                tempMuteDelay.delete(message.author.id)
                            }, 13 * 1000)
                            if(servidor.muteds.length === 0) return;
                            if(!servidor.muteds.find(muted => muted.temp)) return;
                            let timeouts = servidor.muteds.filter(muted => Date.now() >= (muted.date + muted.time))
                            if(timeouts.length === 0) return;
                            let role = await message.guild.roles.find(role => role.name === '🔇Cody Mute')
                            if(!role) return servidor.muteds = [];
                            timeouts.forEach(async user => {
                                if(!message.guild.members.get(user.id)) return servidor.muteds.splice(servidor.muteds.indexOf(servidor.muteds.find(muted => muted.id === user.id)), 1);
                                let member = await message.guild.members.get(user.id)
                                if(!member.roles.get(role.id)) return servidor.muteds.splice(servidor.muteds.indexOf(servidor.muteds.find(muted => muted.id === user.id)), 1);
                                member.removeRole(role.id)
                            })
                        }

                        if(servidor.sugest.get('on')) {
                            if(message.channel.id !== servidor.sugest.get('channel')) return;
                            var canal = await message.guild.channels.get(servidor.sugest.get('channel'))
                            if(servidor.sugest.get('type') === 1) {
                                if(message.author.id !== this.client.user.id) return;
                                await message.react('✅')
                                await message.react('❌')
                            } else if(servidor.sugest.get('type') === 2) {
                                if(message.author.id === this.client.user.id) return;
                                await message.react('✅')
                                await message.react('❌')     
                            }
                        }

                        if(!vipDelay.has(message.author.id)) {
                            vipDelay.add(message.author.id)
                            setTimeout(function() {
                                vipDelay.delete(message.author.id)
                            }, 10 * 1000)
                            this.dbl.hasVoted(message.author.id).then(voted => {
                                if(usuario.vip && !voted) {
                                    usuario.vip = false
                                    usuario.save()
                                    if(!servidor.config.get('vipMessages')) return;
                                    message.channel.send(t('eventos:timeoutVip', { member: message.member }))
                                } else if(!usuario.vip && voted) {
                                    usuario.vip = true
                                    usuario.save()
                                    if(!servidor.config.get('vipMessages')) return;
                                    message.channel.send(t('eventos:definedVip', { member: message.member }))
                                }
                            })
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
                                if(user.vip && !message.member.roles.get(this.config.vipRole)) {
                                    message.member.addRole(this.config.vipRole)
                                } else if(message.member.roles.get(this.config.vipRole) && !user.vip) {
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