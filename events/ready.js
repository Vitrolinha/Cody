module.exports = async function () {
    setTimeout(async () => {
        this.shardLog(`${this.user.tag} iniciado`)
        this.setVotes()
        this.setGame({random: true, force: true})
        if(this.user.id === this.config.codyID) {
            this.dbl.postStats(this.guilds.size, this.shard.id, this.shard.count);
            setInterval(() => {
                this.dbl.postStats(this.guilds.size, this.shard.id, this.shard.count);
            }, 1800000);
        }
        setInterval(async () => {
            this.setVotes()
            this.setGame({random: true, force: false})
        }, 5 * 1000 * 60)
    },10 * 1000)
}