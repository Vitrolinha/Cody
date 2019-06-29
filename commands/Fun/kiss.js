const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client, locale) {
        super (name, client, locale)
        this.aliases = ['beijar']
    }
    async run ({message, argsAlt}, t) {
        let mention = true,
            reg = argsAlt[0] ? argsAlt[0].replace(/[^0-9]/g, '') : mention = false,
            user = mention ? message.guild.members.get(reg) ? message.guild.members.get(reg).user : message.author : null;
        if(!mention) return message.channel.send(t('comandos:kiss.noMention', { member: message.member }));
        if(user.id === message.author.id) return message.channel.send(t('comandos:kiss.mentionYou', { member: message.member }));
        let gif = await this.client.fetch(`https://api.tenor.com/v1/search?q=anime%20kiss&key=${process.env.tenor}&limit=30&anon_id=3a76e56901d740da9e59ffb22b988242`, { 
            method: 'GET',
        }).then(res => res.json()).then(res => {return res.results[Math.floor(Math.random() * 29)].media[0].gif.url}),
            title = t('comandos:kiss.kiss', { member: message.author.username, kissed: user.username }),
            embed = new this.client.Discord.RichEmbed()
                .setTitle(title)
                .setImage(gif)
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289);
        message.channel.send(embed);
    }
}