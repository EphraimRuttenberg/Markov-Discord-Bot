const MessageHandling = require("./MessageHandling.js");
const MarkovChain = require("./MarkovChain.js");
const fs = require("fs");

module.exports = {
    checkCommands : async function (msg, client) {
        const blacklist = MessageHandling.getBlacklist();
        const config = MessageHandling.getConfig();
        var text = msg.content;
        if (text[0] !== commandChar) {
            return;
        }

        //If the command is !chain
        if (text.startsWith(`!chain`)) {
            //If a user is tagged
            if (msg.mentions.users.size > 0) {
                //Get the user that is tagged
                var user = msg.mentions.users.first().id;
                var userMarkovData = {};
                var userChunks = {};
                var userStartingWords = {};
                //Go through all the user's messages and add them to a temporary dataset
                const messages = [];
                for (const [id, channel] of msg.guild.channels) {
                    const channelMsgs = await MessageHandling.getMessages(channel, config.userChainMessageLimit);
                    messages.push(...channelMsgs);
                }
                messages.forEach(message => {
                    if(message.author.id == user && !(MessageHandling.breaksBlacklist(message) || message.content[0] == "!")){
                        let data = MarkovChain.chunkText(message.content, userMarkovData, userChunks, userStartingWords);
                        userMarkovData = data[0];
                        userChunks = data[1];
                        userStartingWords = data[2];
                    }
                });
                msg.channel.send(`<@${user}>: ${MarkovChain.makeChain(userMarkovData, userChunks, userStartingWords,
                    config.minChainLength, config.maxChainLength)}`);

            } else {
                //Otherwise, make a chain based on the regular dataset
                let data = MessageHandling.getData();
                let markovData = data[0];
                let chunks = data[1];
                let startingWords = data[2];
                msg.channel.send(MarkovChain.makeChain(markovData, chunks, startingWords,
                    config.minChainLength, config.maxChainLength));
            }

        //If the command is blacklist
    } else if (text.startsWith(`!blacklist`) && config.admins.indexOf(msg.author.id) > -1) {
            var command = msg.content.split(" ");
            //For adding to the blacklist
            if (command[1] == "add") {
                if (command[2] == "word") {
                    let word = command[3];
                    blacklist.singleWords.push(word);
                    msg.channel.send(`Added the word "${word}" to the blacklist`);

                } else if (command[2] == "phrase") {
                    let phrase = command.slice(3).join(" ");
                    blacklist.fullPhrases.push(phrase);
                    msg.channel.send(`Added the phrase "${phrase}" to the blacklist`);

                } else if (command [2] == "regex") {
                    let regex = command[3];
                    blacklist.regex.push(regex);
                    msg.channel.send(`Added the regular expression "${regex}" to the blacklist`);
                }
            //For removing from the blacklist
            } else if (command[1] == "remove") {
                if (command[2] == "word") {
                    let word = command[3];
                    let index = blacklist.singleWords.indexOf(command[3]);
                    if (index > -1) {
                        blacklist.singleWords.splice(index);
                        msg.channel.send(`Removed the word "${word}" from the blacklist`);
                    } else {
                        msg.channel.send(`${word} is not a word in the blacklist!`);
                    }

                } else if (command[2] == "phrase") {
                    let phrase = command.slice(3).join(" ");
                    let index = blacklist.fullPhrases.indexOf(command[3]);
                    if (index > -1) {
                        blacklist.fullPhrases.splice(index);
                        msg.channel.send(`Removed the phrase "${phrase}" from the blacklist`);
                    } else {
                        msg.channel.send(`${phrase} is not a phrase in the blacklist!`);
                    }

                } else if (command [2] == "regex") {
                    let regex = command[3];
                    let index = blacklist.regex.indexOf(command[3]);
                    if (index > -1) {
                        blacklist.regex.splice(index);
                        msg.channel.send(`Removed the regular expression "${regex}" from the blacklist`);
                    } else {
                        msg.channel.send(`${regex} is not a regular expression in the blacklist!`);
                    }
                }
                } else {
                    msg.channel.send(`That is not the correct syntax for that command. Please refer to the !help command for help`);
                }
                MessageHandling.clearCache();
                MessageHandling.initMessages(client);
                MessageHandling.setBlacklist(blacklist);
                fs.writeFile("blacklist.json", JSON.stringify(blacklist), (err) => {
                    if (err) {
                        throw err;
                     }
                    // success case, the file was saved
                    msg.channel.send("Blacklist updated");
                });
            } else if (text.startsWith(`!clear`) && config.admins.indexOf(msg.author.id) > -1) {
                MessageHandling.clearCache();
                if (config.initAfterClear == 1) {
                    MessageHandling.initMessages(client);
                }
                msg.channel.send("Cache cleared");
            } else if (text.startsWith(`!help`)) {
                var helpText = fs.readFileSync("HelpFile.txt", "utf8");
                msg.channel.send(helpText);
            }
        }
    }
