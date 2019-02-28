module.exports = async function (member) {
    this.database.Guilds.findOne({'_id': member.guild.id}).then(async servidor => {
        if(!servidor) return;
        if(servidor.muteds.find(muted => muted.id === member.id)) {
            var role = await member.guild.roles.find(role => role.name === '🔇Cody Mute')
            if(!role) return servidor.muteds = [];
            member.addRole(role.id)
        }
        if(servidor.autorole.get('on')) {
            servidor.autorole.get('idRoles').forEach(async roleID => {
                if(member.guild.roles.get(roleID)) {
                    member.addRole(roleID).catch(err => {
                        servidor.autorole.get('idRoles').splice(servidor.autorole.get('idRoles').indexOf(roleID), 1);
                        if(servidor.autorole.get('on') && servidor.autorole.get('idRoles').length === 0) {
                            sservidor.autorole.set('on', false)
                        }    
                        servidor.save()
                    })
                } else {
                    servidor.autorole.get('idRoles').splice(servidor.autorole.get('idRoles').indexOf(roleID), 1);
                    servidor.save()
                }
            })
        }
        if(servidor.concierge.get('welcome').on) {
            var ath = servidor.concierge.get('welcome')
            var mensagem = ath.message.replace('{member}', member).replace('{user.name}', member.user.username).replace('{user.id}', member.user.id).replace('{guild}', member.guild.name)
            member.guild.channels.get(ath.channel).send(mensagem).catch(err => {
                ath.on = false
                ath.message = 'None'
                ath.channel = 'None'
                servidor.save()
            })
        }
    })
    if(member.guild.id === this.config.codyGuild && this.user.id !== this.config.canaryID) {
        var roles = [{
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
        this.database.Users.findOne({'_id': member.user.id}).then(user => {
            if(!user) return;
            roles.forEach(role => {
                if(user.cargos.get(role.name)) {
                    member.addRole(role.roleID)
                }
            })
            if(user.vip) {
                member.addRole(this.config.vipRole)
            }
        })
    }
}