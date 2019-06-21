const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['av']
    }
    async run ({message, argsAlt}, t) {
        let user = argsAlt[0] ? message.mentions.users.first() ? message.mentions.users.first() : await this.client.fetchUser(argsAlt.join(' ')).catch(() => {return false}) ? await this.client.fetchUser(argsAlt.join(' ')) : this.client.users.find(user => user.username.toLowerCase() === argsAlt.join(' ').toLowerCase()) ? this.client.users.find(user => user.username.toLowerCase() === argsAlt.join(' ').toLowerCase()) : this.client.users.find(user => user.tag.toLowerCase() === argsAlt.join(' ').toLowerCase()) ? this.client.users.find(user => user.tag.toLowerCase() === argsAlt.join(' ').toLowerCase()) : message.guild.members.find(user => user.displayName.toLowerCase() === argsAlt.join(' ').toLowerCase()) ? message.guild.members.find(user => user.displayName.toLowerCase() === argsAlt.join(' ').toLowerCase()).user : message.guild.members.find(user => user.displayName.toLowerCase().includes(argsAlt.join(' ').toLowerCase())) ? message.guild.members.find(user => user.displayName.toLowerCase().includes(argsAlt.join(' ').toLowerCase())).user : this.client.users.find(user => user.username.toLowerCase().includes(argsAlt.join(' ').toLowerCase())) ? this.client.users.find(user => user.username.toLowerCase().includes(argsAlt.join(' ').toLowerCase())) : message.author : message.author
        let embed = new this.client.Discord.RichEmbed()
            .setTitle(t('comandos:avatar.title', { user: user.username }))
            .setImage(user.displayAvatarURL)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        message.channel.send(embed)
    }
}