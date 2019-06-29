const { command } = require('../../utils')

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['recarregar', 'restart']
    }
    async run ({message, argsAlt, usuario}, t) {
        let start = Date.now()
        if(!(await this.client.verPerm(['owner', 'subowner', 'operator'], false, usuario))) return message.channel.send(t('comandos:reload.noPermission', { member: message.member }));
        if(!argsAlt[0]) return message.channel.send(t('comandos:reload.noCommand', { member: message.member }));
        const arrays = []
        for(const cmds of argsAlt) {
            if(this.client.commands.get(cmds) && !arrays.includes(cmds)) {
                arrays.push(cmds)
            }
        }
        if(!arrays[0]) return message.channel.send(t('comandos:reload.noSearch', { member: message.member }))
        this.client.reload(arrays).then(cmds => {
            let time = Date.now() - start
            let embed = new this.client.Discord.RichEmbed()
                .setTitle(t('comandos:reload.title'))
                .setDescription(t('comandos:reload.desc', { member: message.member, commands: cmds.join(' - '), time: time }))
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289)
            message.channel.send(embed)
        })
    }
}