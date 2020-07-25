const MessageHandling = require("./MessageHandling.js");
const MarkovChain = require("./MarkovChain.js");
const fs = require("fs");

module.exports = {
    checkCommands : async function (msg, client) {
        const blacklist = MessageHandling.getBlacklist();
        const config = MessageHandling.getConfig();
        var text = msg.content;
        if (text[0] !== "!") {
            return;
        }
        try {
            if (config.blacklisted_users.includes(msg.author.id)) {
                return;
            }
        } catch (err) {}

        //If the command is !chain
        if (text.startsWith(`!chain`)) {
            msg.channel.startTyping();
            //Otherwise, make a chain based on the regular dataset
            let data = MessageHandling.getData();
            let markovData = data[0];
            let chunks = data[1];
            let startingWords = data[2];
            msg.channel.send(MarkovChain.makeChain(markovData, chunks, startingWords,
                config.minChainLength, config.maxChainLength));

        //If the command is blacklist
        } else if (text.startsWith(`!blacklist`) && config.admins.indexOf(msg.author.id) > -1) {
            msg.channel.startTyping();
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
                MessageHandling.setBlacklist(blacklist);
                fs.writeFile("blacklist.json", JSON.stringify(blacklist), (err) => {
                    if (err) {
                        throw err;
                     }
                    // success case, the file was saved
                    msg.channel.send("Blacklist updated");
                });
            } else if (text.startsWith(`!clear`) && config.admins.indexOf(msg.author.id) > -1) {
                msg.channel.startTyping()
                MessageHandling.clearCache();
                msg.channel.send("Cache cleared");
            } else if (text.startsWith(`!help`)) {
                var helpText = fs.readFileSync("HelpFile.txt", "utf8");
                msg.channel.send(helpText);
            } else if (text.startsWith(`!chian`)) {
                msg.channel.startTyping()
                msg.channel.send("bro fucked up the command lmao");
            } else if (text.startsWith(`!chhain`)) {
                msg.channel.startTyping()
                msg.channel.send("h key is broken");
            }
            msg.channel.stopTyping(true);
        }
    }
