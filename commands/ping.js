const { command } = require('../utils')

module.exports = class Ping extends command {
    constructor (name, client) {
        super (name, client)
    }
    async run ({message, args}) {
        let pings = await this.client.shard.broadcastEval('this.ping')
        let dit = args[0] ? parseInt(args[0]) - 1 : 1
        let selected = args[0] ? pings[parseInt(dit)] ? parseInt(dit) : this.client.shard.id : this.client.shard.id
        let ping = pings[selected]
        let pesoCor = ping < 100 ? 65280 : ping < 200 ? 16776960 : 16711680
        let embed = new this.client.Discord.RichEmbed()
            .setTitle(`Shard[${(selected + 1)}/${(this.client.shard.count)}]:`)
            .setDescription(t('comandos:ping.desc', { api: parseInt(ping), time: (Date.now() - message.createdAt) }))
            .setColor(pesoCor)
        message.channel.send(embed)
    }
}