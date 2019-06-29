const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['srole']
    }
    async run ({message, args, prefix, usuario}, t) {
        if(!(await this.client.verPerm(['owner', 'subowner', 'operator', 'developer'], false, usuario))) return message.channel.send(t('comandos:staffrole.noPermission'));
        let cargosA = ['owner', 'subowner', 'operator', 'developer', 'supervisor', 'designer']
        let cargosB = {
            'owner': { name: 'owner', content: usuario.cargos.get('owner'), permission: 5 },
            'subowner': { name: 'subwoner', content: usuario.cargos.get('subowner'), permission: 4 },
            'operator': { name: 'operator', content: usuario.cargos.get('operator'), permission: 3 },
            'developer': { name: 'developer', content: usuario.cargos.get('developer'), permission: 2 },
            'supervisor': { name: 'supervisor', content: usuario.cargos.get('supervisor'), permission: 1 },
            'designer': { name: 'designer', content: usuario.cargos.get('designer'), permission: 1 }
        }
        let authorPerm = 0
        cargosA.forEach(role => { if(cargosB[role].content) { if(authorPerm < cargosB[role].permission) { authorPerm = cargosB[role].permission } } })
        let invalid = new this.client.Discord.RichEmbed()
            .addField(t('comandos:staffrole.howToUse'), t('comandos:staffrole.howDesc', { prefix: prefix }), false)
            .addField(t('comandos:staffrole.roles'), `\`${cargosA.join('` **|** `')}\``)
            .setColor(5289)
        if(!args[2]) return message.channel.send(invalid);
        if(args[0].toLowerCase() !== 'add' && args[0].toLowerCase() !== 'del') return message.channel.send(t('comandos:staffrole.invalidFunction', { function: args[0].toLowerCase() }));
        if(!cargosA.includes(args[1].toLowerCase())) return message.channel.send(t('comandos:staffrole.roleNotExist', { role: args[1].toLowerCase(), roles: cargosA.join('` **|** `') }));
        if(!message.mentions.users.first()) return message.channel.send(t('comandos:staffrole.noMention'));
        let funcao = args[0].toLowerCase()
        let cargo = args[1].toLowerCase()
        let usuarioMencionado = message.mentions.users.first()
        if(usuarioMencionado.bot) return message.channel.send(t('comandos:staffrole.mentionBot', { member: message.member }))
        if(cargosB[cargo].permission >= authorPerm && message.author.id !== this.client.config.ownerID) return message.channel.send(t('comandos:staffrole.noRolePermission'));
        let mencionadoDB = await this.client.docDB({type: 1, content: usuarioMencionado})
        if(funcao === 'add' && mencionadoDB.cargos.get(cargo)) return message.channel.send(t('comandos:staffrole.alreadyHaveRole', { member: message.member }));
        if(funcao === 'del' && !mencionadoDB.cargos.get(cargo)) return message.channel.send(t('comandos:staffrole.roleNotFound', { member: message.member }));
        if(funcao === 'add') {
            if(mencionadoDB.banned.get('ban')) return message.channel.send(t('comandos:staffrole.bannedUser', { member: message.member }))
            mencionadoDB.cargos.set(cargo, true)
            message.channel.send(t('comandos:staffrole.added', { role: cargo }))
            if(this.client.dataStaff.get(cargo).includes(mencionadoDB._id)) return;
            this.client.dataStaff.get(cargo).push(mencionadoDB._id)
        } else if(funcao === 'del') {
            mencionadoDB.cargos.set(cargo, false)
            message.channel.send(t('comandos:staffrole.removed', { role: cargo }))
            if(!this.client.dataStaff.get(cargo).includes(mencionadoDB._id)) return;
            this.client.dataStaff.get(cargo).splice(this.client.dataStaff.get(cargo).indexOf(mencionadoDB._id), 1)
        }
        mencionadoDB.save();
    }
}