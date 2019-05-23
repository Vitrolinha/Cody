if (message.content.startsWith(prefix + "set comum")) {
    if (!message.mentions.users.size < 1) {
        if (!razaou.length < 1) {
            database.Members.findOne({
                "_id": message.mentions.users.first().id
            }, function (erro, documento) {
                if (documento) {
                    if (parseInt(args[2]) > 0) {
                        let count = parseInt(args[2])
                        for (i = 1; i < count; i++) {
                            documento.caixas.push('comum')
                            if (i === count) {
                                documento.save()
                            }
                        }
                        message.channel.send(`:corretor: As caixas **` + razaot + `** foi setado para **` + message.mentions.users.first().username + `**!`)
                    } else {
                        message.channel.send(`:errador: ` + message.author + `, Não pode ser menor que 0!`)
                    }
                } else {
                    message.channel.send(`:errador: ` + message.author + `, Este usuário não possui um database.`)
                }
            })

        } else {
            message.channel.send(`:errador: ` + message.author + `, Diga quantas caixas deseja setar!`)
        }
    } else {
        message.channel.send(`:errador: ` + message.author + `, Mencione quem deseja setar caixas!`)
    }
}