module.exports = class command{
    constructor(name, client, locale) {
        this.name = name;
        this.client = client;
        this.locale = locale;
        this.aliases = [];

    }
    process({message, args, argsAlt, prefix, usuario, servidor}, t, setFixedT) {
        return this.run({message, args, argsAlt, prefix, usuario, servidor}, t, setFixedT);
    }
    run () {}

}