const Cody = require('./Cody')
const client = new Cody()
const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect(process.env.database, { useNewUrlParser: true }, (err) => {
  if (err) return console.log(`Shard ${client.shard.id + 1}: Erro ao conectar no database!\n${err}`)
  console.log(`Shard ${client.shard.id + 1}: Conectado ao BANCO DE DADOS!`)
})

const User = new Schema({
  _id: {
    type: String
  },
  economy: {
    type: Map,
    default: { codes: 0, decoders: 1, lastDecode: '0000000000000', capacitors: 1, warned: true, warns: false, damaged: { on: false, time: '0000000000000', lastDamaged: '0000000000000' } }
  },
  setup: {
    type: Map,
    default: { buyed: false, internet: { buyed: false, lastPayment: '0000000000000' } }
  },
  altBought: {
    type: Array,
    default: []
  },
  banned: {
    type: Map,
    default: { ban: false, tempban: false, time: 0 }
  },
  cargos: {
    type: Map,
    default: { owner: false, subowner: false, operator: false, developer: false, supervisor: false, designer: false }
  },
  vip: {
    type: Map,
    default: { on: false, time: '0000000000000', date: '0000000000000', votePoints: 0, warned: true, warns: true, verify: { day: 0, given: false, dbl: 0, bpd: 0, mbl: false } }
  }
})

const Guild = new Schema({
  _id: {
    type: String
  },
  lang: {
    type: String,
    default: 'pt-BR'
  },
  prefix: {
    type: String,
    default: 'c!'
  },
  concierge: {
    type: Map,
    default: { welcome: { on: false, message: 'None', channel: 'None' }, byebye: { on: false, message: 'None', channel: 'None' } }
  },
  autorole: {
    type: Map,
    default: { on: false, idRoles: [] }
  },
  register: {
    type: Map,
    default: { registatorsRole: [], registeredRoles: [], beginnerRoles: [] }
  },
  sugest: {
    type: Map,
    default: { on: false, channel: 'None', coldown: 0, type: 0 }
  },
  config: {
    type: Map,
    default: { vipMessages: true, level: false }
  },
  level: {
    type: Map,
    default: { channelLogs: { on: false, channel: 'None' }, customMessage: { on: false, message: 'None' }, users: [] }
  },
  muteds: {
    type: Array,
    default: []
  },
  lockedChannels: {
    type: Array,
    default: []
  },
  allowedChannels: {
    type: Array,
    default: []
  },
  votePoints: {
    type: Number,
    default: 0
  },
  vipBought: {
    type: Array,
    default: []
  },
  security: {
    type: Array,
    default: []
  }
})

const Ship = new Schema({
  _id: {
    type: String
  },
  user1: {
    type: String
  },
  user2: {
    type: String
  },
  percentage: {
    type: Number,
    default: 0
  }
})

const Command = new Schema({
  _id: {
    type: String
  },
  maintenance: {
    type: Boolean,
    default: false
  }
})

const Form = new Schema({
  _id: {
    type: String
  },
  user: {
    type: String
  },
  role: {
    type: String
  },
  reason: {
    type: String,
  },
  date: {
    type: String,
    default: '0000000000000'
  }
})

const Users = mongoose.model('Users', User)
const Guilds = mongoose.model('Guilds', Guild)
const Commands = mongoose.model('Commands', Command)
const Forms = mongoose.model('Forms', Form)
const Ships = mongoose.model('Ships', Ship)
exports.Users = Users
exports.Guilds = Guilds
exports.Commands = Commands
exports.Forms = Forms
exports.Ships = Ships