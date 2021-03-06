# Markov-Discord-Bot

Markov Bot is a bot that uses markov chains to imitate users' messages in discord servers. To set it up, create a bot [here,](https://discordapp.com/developers/applications). Then clone this repository onto a node.js enabled server and install discord.js with ```npm install discord.js``` 

Then set up the config file as such:

- token: your bot's oAuth token given by your Discord application when you made it, this should be between double quotes

- autorun: Don't change this from "true"

- minChainLength: The minimum number of words for a markov chain to be sent

- maxChainLength: The number of words for which the chain will be cut short if it exceeds it without finishing, leave as 0 to ignore this setting, but be weary that this may result in infinite loops and a chain not being created


- admins: A list of users with permission to use admin commands. Each admin should be the user's id encased in double quotes, with each seperate string seperated by a comma. Example: ["289467912836", "178924612893"]

- autoPrintInterval: The number of messages after which the bot will automatically send a markov chain. Set to 0 if you do not want it to automatically send markov chains

- cacheClearMessageInterval: The number of messages after which the cache will be automatically cleared, set to 0 to disable

- cacheClearTimeInterval: The number of minutes after which the cache will be automatically cleared, set to 0 to disable. It is highly recommended that either this setting or the one above is enabled, if not both

- allowPings: Whether or not the bot should be allowed to ping other users. Set to 0 if you do not want it to do this, otherwise set to 1

- blacklisted_users: List of users who cannot use commands at all. Each entry should be the user's id encased in double quotes, with each seperate string seperated by a comma. Example: ["289467912836", "178924612893"]

- noCommands: 1 or 0. If 1, !chain and !help will not do anything

- replyChannel: A list channel id's surrounded by quotes and seperated by commas. If included and not blank, will only send messages in the specified channels, and will default to the first one if it redirects a message. Example: "replyChannel": ["346534123123", "23456432455623"]. In this example it will reply in both of those channels, but will redirect messages from all other channels to the first one denoted by 346534123123

- commandChannel: List of channels that the bot will accept commands in. Leave blank or do not include to accept commands from anywhere. Overriden by noCommands. Format is a list of channel id's seperated by commas surrounded by square brackets. Example: "commandChannel": ["78594932423644", "3237483687623"]

### Commands

The commands for the bot are as follows, with square brackets indicating an optional argument for the command and angled brackets indicating necessary arguments:

- `!chain`

This command will make the bot send a markov chain

- `!help`

Displays a message similar to this list of commands. The help message can be edited by editing `HelpFile.txt`

**Admin only commands**

These commands are only for people designated admins in the config file:

- `!blacklist <add/remove> <word/phrase/regex> <word to add/remove>`

This command can either add or remove phrases, words, and regular expressions to/from the blacklist, all words or phrases should be in lowercase

Word blacklists are only detected if a word by itself contains the blacklist

Example: If 'nam' is blacklisted, "He said nam" will trigger the blacklist but not "His name" because it is part of a larger word
Phrase blacklists detect if that sequence of characters exists in any form

Example: If 'nam' is blacklisted, "He said nam" will trigger the blacklist and as well as "His name"

Regex blacklists add a regular expression that can be matched to cover more cases than just a word or phrase blacklist

The blacklist can be manually edited by adding phrases, words, or regular expressions to their respective lists in `blacklist.json`

- `!clear`
This command clears the cache manually
