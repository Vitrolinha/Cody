const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['abraçar', '$HIDEabracar']
    }
    async run ({message, argsAlt}, t) {
        let mention = true,
            type = 'hug',
            reg = argsAlt[0] ? argsAlt[0].replace(/[^0-9]/g, '') : mention = false,
            user = mention ? message.guild.members.get(reg) ? message.guild.members.get(reg).user : message.author : null;
        if(!mention) return message.channel.send(t('comandos:hug.noMention', { member: message.member }));
        if(user.id === message.author.id) {
            type = 'lonely'
        }
        let gif = await this.client.fetch(`https://api.tenor.com/v1/search?q=${type}%20anime&key=${process.env.tenor}&limit=25&anon_id=3a76e56901d740da9e59ffb22b988242`, { 
            method: 'GET',
        }).then(res => res.json()).then(res => {return res.results[Math.floor(Math.random() * 24)].media[0].gif.url}),
            title = type === 'hug' ? t('comandos:hug.hug', { member: message.author.username, hugged: user.username }) : t('comandos:hug.alone', { member: message.author.username }),
            embed = new this.client.Discord.RichEmbed()
                .setTitle(title)
                .setImage(gif)
                .setTimestamp(new Date())
                .setFooter(message.author.username, message.author.displayAvatarURL)
                .setColor(5289);
        message.channel.send(embed);
    }
}