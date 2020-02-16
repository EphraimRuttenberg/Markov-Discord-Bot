const fs = require("fs");
const MarkovChain = require("./MarkovChain.js");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
var blacklist = JSON.parse(fs.readFileSync("blacklist.json", "utf8"));
var markovData = {};
var startingWords = {};
var chunks = {};
var messagesSent = 0;
var messagesSinceClear = 0;
var timeSinceClear = Date.now();

module.exports = {

    addData: function (msg) {
        var text = msg.content;
        if (module.exports.breaksBlacklist(msg)
        || text[0] == "!") {
            return;
        }
        let data = MarkovChain.chunkText(text, markovData, chunks, startingWords);
        markovData = data[0];
        chunks = data[1];
        startingWords = data[2];
    },


    clearCache: function () {
        chunks = {};
        markovData = {};
        startingWords = {};
    },

    breaksBlacklist: function (msg) {
        //Checks whether or not the text breaks the blacklist
        var text = msg.content;
        let removeStrings = [",", ".", "`", "'", "/", "?", "!", "-", "_", "\"", "'", "\\"]
        for (var i = 0; i < 5; i++) {
            text = text.replace(removeStrings[i], "");
        }

        text = text.toLowerCase();
        var splitText = text.split(" ");

        const singleWords = blacklist["singleWords"];
        const fullPhrases = blacklist["fullPhrases"];
        const regex = blacklist["regex"];

        if (msg.mentions.users.size > 0 && config.allowPings == 0) {
            return true;
        }

        for (var i = 0; i < singleWords.length; i++) {
            if (splitText.includes(singleWords[i])) {
                return true;
            }
        }
        for (var i = 0; i < fullPhrases.length; i++) {
            if (text.includes(fullPhrases[i])) {
                return true;
            }
        }
        for (var i = 0; i < regex.length; i++) {
            let regPattern = new RegExp(regex[i]);
            if (regPattern.test(text)) {
                return true;
            }
        }
        return false;
    },



    getData: function () {
        return [markovData, chunks, startingWords];
    },

    getBlacklist: function () {
        return blacklist;
    },

    setBlacklist: function (_blacklist) {
        blacklist = _blacklist;
    },

    getConfig: function () {
        return config;
    },

    HandleMessage: function (msg, client) {
        messagesSent++;
        messagesSinceClear++;
        if (messagesSent >= config.autoPrintInterval && config.autoPrintInterval > 0) {
            messagesSent = 0;
            msg.channel.send(MarkovChain.makeChain(markovData, chunks, startingWords,
                config.minChainLength, config.maxChainLength));
        }
        //If theres enough messages to clear the cache
        if (messagesSinceClear >= config.cacheClearMsgInterval &&
        config.cacheClearMsgInterval > 0) {
            messagesSinceClear = 0;
            module.exports.clearCache();
            msg.channel.send(`Cache automatically cleared after ${config.cacheClearMsgInterval} messages`);
        }
        //If enough time has elapsed to clear the cache
        if (Date.now() - timeSinceClear >= config.cacheClearTimeInterval * 60000 &&
        config.cacheClearTimeInterval > 0) {
            timeSinceClear = Date.now();
            module.exports.clearCache();
            msg.channel.send(`Cache automatically cleared after ${config.cacheClearTimeInterval} minutes`);
        }
        module.exports.addData(msg);
    }
}
