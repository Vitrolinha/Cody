require('dotenv').config()

const Cody = require('./Cody'),
    client = new Cody({
        autoReconnect: true,
        messageCacheMaxSize: 2024,
        fetchAllMembers: true,
        disabledEvents: ['typingStart', 'typingStop', 'guildMemberSpeaking'],
        messageCacheLifetime: 1680,
        disableEveryone: false,
        messageSweepInterval: 1680
    });

client.login(process.env.token)