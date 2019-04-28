const { command } = require('../utils')
const inWindow = []

module.exports = class Forms extends command {
    constructor (name, client) {
        super (name, client)
    }
    async run ({message, usuario}) {
        if(!(await this.client.verPerm(['owner', 'subowner', 'operator'], false, usuario))) return message.channel.send(t('comandos:forms.noPermission'));
        if(inWindow.includes(message.author.id)) return message.channel.send(t('comandos:forms.inWindow'))
        let first = await this.client.database.Forms.findOne({})
        if(!first) return message.channel.send(t('comandos:forms.notHaveForms'))
        let genEmbed = async (cnt) => {
            let embed = new this.client.Discord.RichEmbed()
            .setTitle(this.client.users.get(cnt.user) ? `${this.client.users.get(cnt.user).username} (${cnt.role}):` : `${cnt.user} (${cnt.role})`)
            .setDescription(cnt.reason)
            .setThumbnail(this.client.users.get(cnt.user) ? this.client.users.get(cnt.user).displayAvatarURL : this.client.user.displayAvatarURL)
            .setTimestamp(new Date(parseInt(cnt.date)))
            .setFooter(message.author.username, message.author.displayAvatarURL)
            .setColor(5289)
            return embed;
        }
        message.channel.send(await genEmbed(first)).then(async msg => {
            await msg.react('✅')
            await msg.react('❌')
            await msg.react('🖐')
            const aprovar = msg.createReactionCollector((r, u) => r.emoji.name === "✅" && u.id === message.author.id, { time: 120000 });
            const reprovar = msg.createReactionCollector((r, u) => r.emoji.name === "❌" && u.id === message.author.id, { time: 120000 });
            const cancelar = msg.createReactionCollector((r, u) => r.emoji.name === "🖐" && u.id === message.author.id, { time: 120000 });
            let form = await first;
            inWindow.push(message.author.id)
            aprovar.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                this.client.database.Users.findOne({"_id": form.user}).then(async user => {
                    user.cargos.set(form.role, true)
                    user.save()
                    let mtsg = t('comandos:forms.approved', { member: this.client.users.get(form.user), author: message.member, role: form.role })
                    this.client.shard.broadcastEval(`
                        if(this.guilds.get("${this.client.config.codyGuild}")) {
                        this.guilds.get("${this.client.config.codyGuild}").channels.get("540740757888172043").send("${mtsg}")
                        }
                    `)
                    await form.delete()
                    form = await this.client.database.Forms.findOne({})
                    if(!form) return cancelar.emit('end')
                    msg.edit(await genEmbed(form))
                })
            })
            reprovar.on('collect', async r => {
                r.remove(r.users.last().id).catch(e => {})
                let mtsg2 = await t('comandos:forms.refused', { member: this.client.users.get(form.user), author: message.member, role: form.role })
                this.client.shard.broadcastEval(`
                    if(this.guilds.get("${this.client.config.codyGuild}")) {
                    this.guilds.get("${this.client.config.codyGuild}").channels.get("540740757888172043").send("${mtsg2}")
                    }
                `)
                await form.delete()
                form = await this.client.database.Forms.findOne({})
                if(!form) return cancelar.emit('end')
                msg.edit(await genEmbed(form))
            })
            cancelar.on('collect', async r => {
                inWindow.splice(inWindow.indexOf(message.author.id), 1)
                msg.delete().catch(e => {})
                message.delete().catch(e => {})
                aprovar.emit('end')
                reprovar.emit('end')
                cancelar.emit('end')
            })
            cancelar.on('end', async r => {
                inWindow.splice(inWindow.indexOf(message.author.id), 1)
                msg.delete().catch(e => {})
                message.delete().catch(e => {})
                aprovar.emit('end')
                reprovar.emit('end')
            })
        })
    }
}