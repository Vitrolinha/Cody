const { command } = require('../utils')

module.exports = class BotConfig extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['bconfig']
    }
    async run ({message, argsAlt, usuario, prefix}, t) {
        if(!(await this.client.verPerm(['owner', 'subowner', 'developer', 'operator'], false, usuario))) return message.channel.send(t('comandos:botconfig.noPermission'));
        let invalid = new this.client.Discord.RichEmbed()
            .addField(t('comandos:botconfig.howToUse'), t('comandos:botconfig.howDesc', { prefix: prefix }), false)
            .setColor(5289)
        let funcao = argsAlt[0]
        if(!funcao) return message.channel.send(invalid)
        funcao = funcao.toLowerCase()
        if(funcao === 'cmd') {
            funcao = argsAlt[1]
            if(!funcao) return message.channel.send(invalid)
            funcao = funcao.toLowerCase()
            if(funcao === 'manu') {
                let cmd = argsAlt[2]
                if(!cmd) return message.channel.send(t('comandos:botconfig.noCmdManu'))
                cmd = argsAlt[2].toLowerCase()
                this.client.database.Commands.findOne({'_id': cmd}).then(cmdDB => {
                    if(!cmdDB) return message.channel.send(t('comandos:botconfig.cmdNotExist'))
                    if(!cmdDB.maintenance) { message.channel.send(t('comandos:botconfig.activated', { cmd: cmd })) } else { message.channel.send(t('comandos:botconfig.disabled', { cmd: cmd })) }
                    cmdDB.maintenance = cmdDB.maintenance ? false : true
                    cmdDB.save()
                })
            } else {
                message.channel.send(t('comandos:botconfig.invalidFunc', { func: funcao }));
            }
        } else {
            message.channel.send(t('comandos:botconfig.invalidFunc', { func: funcao }));
        }
    }
}