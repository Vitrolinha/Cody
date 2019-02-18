console.log("Iniciando...")
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json")
const database = require('./database.js')
var xpCol = new Set()
let xpRDM = Math.round(Math.random() * 45)

const prefix = config.prefix


client.on("ready", () => {
    console.log("Iniciado com sucesso!")
    console.log(`Servidores(${client.guilds.size}):\n${client.guilds.map(servidor => servidor.name).join(", ")}`)
    client.user.setActivity('Use "f!ajuda" para saber mais sobre minhas funções!', {
        type: 'PLAYING'
    });
})

client.on("message", (message) => {

    if (!message.content.startsWith(prefix)) return;

    database.Users.findOne({'_id': message.author.id}).then(usuario => {
        if (usuario) {
            if (message.channel.type == "dm") return;
            if (message.author.bot) return;
            if (!message.content.startsWith(prefix)) return;

            const args = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/g);
            const command = args.shift();

            try {
                let commandFile = require(`./comandos/${command}.js`);
                commandFile.run(client, message, args);
            } catch (err) {

                if (err.code == "MODULE_NOT_FOUND") return;
                console.error(err);

            }
            process.on('unhandledRejection', (err) => {
                console.error(err)
            })
        } else {
            var usuario = new database.Users({
                _id: message.author.id
            })
            usuario.save()

            if (message.channel.type == "dm") return;
            if (message.author.bot) return;
            if (!message.content.startsWith(prefix)) return;

            const args = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/g);
            const command = args.shift();

            try {
                let commandFile = require(`./comandos/${command}.js`);
                commandFile.run(client, message, args);
            } catch (err) {

                if (err.code == "MODULE_NOT_FOUND") return;
                console.error(err);

            }
            process.on('unhandledRejection', (err) => {
                console.error(err)
            })
        }
        //xp
        if (message.author.bot) return;
        if (xpCol.has(message.author.id)) return;
        database.Users.findOne({"_id": message.author.id}, function (erro, documento) {
            if (documento) {
                var unbug = 350 * documento.level + 1
                if (documento.xp > unbug) {
                    documento.xp += xpRDM
                    documento.level += 1
                    message.reply(`**Você subiu para o level ${documento.level}**`);
                    documento.xp = 0
                    documento.save()
                    xpCol.add(message.author.id)
                    setTimeout(function () {
                        xpCol.delete(message.author.id)
                    }, 30 * 1000)
                } else {
                    documento.xp += xpRDM
                    documento.save()
                    xpCol.add(message.author.id)
                    setTimeout(function () {
                        xpCol.delete(message.author.id)
                    }, 30 * 1000)
                }
            } else {
                var pessoa = new database.Users({
                    _id: message.author.id,
                    coins: 20000,
                    gemas: 0,
                    cps: 2,
                    level: 0,
                    xp: 0
                })

                pessoa.save()
            }
        });
    })
})

client.login(config.token);