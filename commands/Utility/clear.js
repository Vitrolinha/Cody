const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['limpar', 'purge', 'prune']
    }
    async run ({message, argsAlt, usuario}, t) {
        if(!(await this.client.verPerm(['MANAGE_MESSAGES', 'owner', 'subowner', 'operator'], message.member, usuario))) return message.channel.send(t('comandos:clear.noPermission'));
        if(!message.channel.permissionsFor(this.client.user.id).has('MANAGE_MESSAGES')) return message.channel.send(t('comandos:clear.noPermBot'));
        if(!argsAlt[0]) return message.channel.send(t('comandos:clear.noargsAlt'));
        if(!Number(argsAlt[0])) return message.channel.send(t('comandos:clear.notNumber', { nan: argsAlt[0] }));
        let quantidade = parseInt(argsAlt[0])
        if(quantidade <= 0) return message.channel.send(t('comandos:clear.number0', { count: quantidade }));
        if(quantidade > 100) return message.channel.send(t('comandos:clear.more100', { number: quantidade }));
        await message.delete()
        message.channel.bulkDelete(quantidade)
        message.channel.send(t('comandos:clear.cleared', { count: quantidade, member: message.author.username })).then(msg => {
            setTimeout(() => {
                msg.delete()
            }, 5 * 1000)
        })
    }
}