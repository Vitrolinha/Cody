const { command } = require('../utils')

module.exports = class Eval extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['e', 'ev', 'execute']
    }
    async run ({message, args, argsAlt, usuario, servidor}, t) {
        if(!(await this.client.verPerm(['owner', 'subowner', 'operator'], false, usuario))) return message.channel.send(t('comandos:eval.noPermission'));
        let code = args.join(' ')
        if(!code) return message.channel.send(t('comandos:eval.noCode'));
        if(code.includes('token')) return;
        let embed = new this.client.Discord.RichEmbed()
            .setThumbnail(this.client.user.displayAvatarURL)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
        try {
            let resultado = await eval(code)
            embed.addField(t('comandos:eval.code'), `\`\`\`${code}\`\`\``, false)
            embed.addField(t('comandos:eval.result'), `\`\`\`${resultado}\`\`\``, false)
            embed.setColor(5289)
            message.channel.send(embed)
        } catch(err) {
            embed.addField(t('comandos:eval.code'), `\`\`\`${code}\`\`\``, false)
            embed.addField(t('comandos:eval.error'), `\`\`\`${err}\`\`\``, false)
            embed.setColor(16711680)
            message.channel.send(embed)
        }
    }
}