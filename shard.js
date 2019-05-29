const express = require('express');
const app = express();

app.get("/", (request, response) => {
    response.sendStatus(200);
  });
  app.listen(process.env.PORT);

const { ShardingManager } = require('discord.js')
const manager = new ShardingManager(`./index.js`, { totalShards: 2 })

manager.on('launch', shard => console.log(`Shard ${(shard.id + 1)}: iniciada com sucesso!`))

manager.spawn()