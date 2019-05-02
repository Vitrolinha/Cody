const { command } = require('../utils')

module.exports = class Avatar extends command {
    constructor (name, client) {
        super (name, client)
    }
    async run ({message, args}, t) {
        let user = args[0] ? message.mentions.users.first() ? message.mentions.users.first() : await this.client.fetchUser(args.join(' ')) ? await this.client.fetchUser(args.join(' ')) : this.client.users.find(user => user.username.toLowerCase() === args.join(' ').toLowerCase()) ? this.client.users.find(user => user.username.toLowerCase() === args.join(' ').toLowerCase()) : this.client.users.find(user => user.tag.toLowerCase() === args.join(' ').toLowerCase()) ? this.client.users.find(user => user.tag.toLowerCase() === args.join(' ').toLowerCase()) : message.guild.members.find(user => user.displayName.toLowerCase() === args.join(' ').toLowerCase()) ? message.guild.members.find(user => user.displayName.toLowerCase() === args.join(' ').toLowerCase()).user : message.guild.members.find(user => user.displayName.toLowerCase().includes(args.join(' ').toLowerCase())) ? message.guild.members.find(user => user.displayName.toLowerCase().includes(args.join(' ').toLowerCase())).user : this.client.users.find(user => user.username.toLowerCase().includes(args.join(' ').toLowerCase())) ? this.client.users.find(user => user.username.toLowerCase().includes(args.join(' ').toLowerCase())) : message.author : message.author
        let embed = new this.client.Discord.RichEmbed()
            .setTitle(t('comandos:avatar.title', { user: user.username }))
            .setImage(user.displayAvatarURL)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
        message.channel.send(embed)
    }
}