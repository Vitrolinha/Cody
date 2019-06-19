const { command } = require('../../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
    }
    async run ({message, args}, t) {
        let pings = await this.client.shard.broadcastEval('this.ping'),
            dit = args[0] ? parseInt(args[0]) - 1 : 1,
            selected = args[0] ? pings[parseInt(dit)] ? parseInt(dit) : this.client.shard.id : this.client.shard.id,
            ping = pings[selected],
            pesoCor = ping < 100 ? 65280 : ping < 200 ? 16776960 : 16711680,
            embed = new this.client.Discord.RichEmbed()
                .setTitle(`Shard[${(selected + 1)}/${(this.client.shard.count)}]:`)
                .setDescription(t('comandos:ping.desc', { api: parseInt(ping), time: (Date.now() - message.createdAt) }))
                .setColor(pesoCor);
        message.channel.send(embed)
    }
}