const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['shipar']
    }
    async run ({message, argsAlt}, t) {
        if(!message.mentions.users.first()) return message.channel.send(t('comandos:ship.noMention', { member: message.member }))
        let mentions = message.mentions.users.array().reverse(),
            user1 = mentions.length > 1 ? mentions[0] : message.author,
            user2 = mentions.length > 1 ? mentions[1] : mentions[0],
            name = user1.username.substring(0, 5) + user2.username.substring(user2.username.length - 4, user2.username.length),
            shipDB = await this.client.docDB({type: 5, id1: user1.id, id2: user2.id});
        const canvas = this.client.canvasNP.createCanvas(384, 128),
            ctx = canvas.getContext('2d'),
            avatar1 = await this.client.canvasNP.loadImage(user1.avatarURL),
            avatar2 = await this.client.canvasNP.loadImage(user2.avatarURL);
        let bar = '█'.repeat(parseInt(shipDB.percentage/10)) + '.'.repeat(parseInt((100-shipDB.percentage)/10)),
            emoji = shipDB.percentage < 30 ? await this.client.canvasNP.loadImage('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/214/face-with-cold-sweat_1f613.png')
            : shipDB.percentage < 60 ? await this.client.canvasNP.loadImage('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/214/face-with-rolling-eyes_1f644.png')
            : await this.client.canvasNP.loadImage('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/214/smiling-face-with-heart-shaped-eyes_1f60d.png')
        bar = bar.length < 10 ? bar + '.'.repeat(10 - bar.length) : bar
        ctx.drawImage(emoji, 134, 12, 116, 116)
        ctx.drawImage(avatar1, 0, 0, 128, 128)
        ctx.drawImage(avatar2, 256, 0, 128, 128)
        let attachment = new this.client.Discord.Attachment(canvas.toBuffer(), 'ship.png'),
            embed = new this.client.Discord.RichEmbed()
            .setDescription(`**${name}** \`${shipDB.percentage}% [${bar}]\`\n${t(`comandos:ship.phrases.${parseInt(shipDB.percentage/10)}0`)}`)
            .attachFiles([attachment])
            .setImage('attachment://ship.png')
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(12910792);
        message.channel.send(embed)
    }
}