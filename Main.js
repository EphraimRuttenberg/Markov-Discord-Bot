const Discord = require("discord.js");
const MessageHandling = require("./MessageHandling.js");
const CommandParser = require("./CommandParser");

const config = MessageHandling.getConfig();
const oauth = config["token"];

var client = new Discord.Client(config);


client.on('ready', () => {
    console.log('Connected');
});

client.on('message', (msg) => {
    if (msg.author.bot) {
        console.log("bot detected " + msg.content);
        return;
    }

    console.log(msg.content);
    CommandParser.checkCommands(msg, client);
    if (msg.content[0] !== "!") {
        MessageHandling.HandleMessage(msg, client);
    }

});

client.login(oauth)
