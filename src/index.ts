import Poll from './Poll'
import PollOption from "./PollOption"
import {TextChannel, Message, Client, PartialMessage} from "discord.js"
import * as fs from "fs";

let _pollsList: Array<Poll> = []
let _client: Client
let _pathToPollsSaveFile: string

export async function init(client: Client, pathToPollsSaveFile: string) {
    await new Promise<void>((resolve, reject) => {
        if(client.isReady()) resolve()

        client.once("error", reject);
        client.once("ready", () => {
            client.off("error", reject);
            resolve();
        });
    }).catch(() => {
        throw Error("Error during initialization")
    })

    _client = client
    _pathToPollsSaveFile = pathToPollsSaveFile

    await loadPollsFromFile().then(() => {
        writePollsInFiles()
    }).catch((e) => {
        throw Error(e.message)
    })

    client.on('messageReactionAdd', (messageReaction, user) => {
        let poll = getPollByMessage(messageReaction.message);
        if(poll && !user.bot) {
            poll.vote(user.id, messageReaction.emoji.name)
            poll.updateMessageAndReact()
        }
    })

    client.on('messageReactionRemove', (messageReaction, user) => {
        let poll = getPollByMessage(messageReaction.message);
        if(poll && !user.bot) {
            poll.unVote(user.id, messageReaction.emoji.name)
            poll.updateMessageAndReact()
        }
    })

    client.on('messageReactionRemoveAll', async (message) => {
        let poll = getPollByMessage(message);
        if(poll) {
            await poll.updateMessageAndReact()
        }
    })

    client.on('messageDelete', async (message) => {
        let poll = getPollByMessage(message);
        if(poll) {
            await removePollInStorage(poll)
        }
    })
}

export async function writePollsInFiles() {
    let data = {
        pollsList: _pollsList.map(poll => poll.toJson())
    }

    try {
        fs.writeFileSync(_pathToPollsSaveFile, JSON.stringify(data, null, "\t"))
    } catch (e) {
        throw Error("Error during saving polls")
    }
}

export async function loadPollsFromFile() {
    _pollsList = []

    if(fs.existsSync(_pathToPollsSaveFile)) {
        let pollsFile

        try {
            pollsFile = fs.readFileSync(_pathToPollsSaveFile, 'utf-8')
        } catch (e) {
            throw Error("Error while loading polls")
        }

        if(pollsFile) {
            let pollsJson = JSON.parse(pollsFile)
            if(pollsJson.pollsList && pollsJson.pollsList instanceof Array) {
                await Promise.all(pollsJson.pollsList.map(async jsonPolls => {
                   if(
                       jsonPolls.title && jsonPolls.title.length > 0 &&
                       jsonPolls.description &&
                       jsonPolls.expireTime
                   ) {
                       let pollsOptionsList: Array<PollOption> = []
                       if(jsonPolls.options && jsonPolls.options instanceof Array && jsonPolls.options.length >= 2) {
                           jsonPolls.options.forEach(jsonPollOption => {
                               if(
                                   jsonPollOption.emote &&
                                   jsonPollOption.libelle && jsonPollOption.libelle.length > 0 &&
                                   jsonPollOption.hasOwnProperty("multiOptions") && typeof jsonPollOption.multiOptions == "boolean"
                               ) {
                                   pollsOptionsList.push(new PollOption(jsonPollOption.emote, jsonPollOption.libelle, jsonPollOption.multiOptions))
                               }
                           })

                           if(pollsOptionsList.length >= 2) {
                               let guild = await _client.guilds.fetch(jsonPolls.guildId).catch(() => {})
                               if(guild) {
                                   let channel = await guild.channels.fetch(jsonPolls.channelId).catch(() => {})
                                   if(channel && channel.isText()) {
                                       let message = await channel.messages.fetch(jsonPolls.messageId).catch(() => {})
                                       if(message && message.author === _client.user) {
                                           let poll = new Poll(jsonPolls.title, jsonPolls.description, pollsOptionsList, jsonPolls.expireTime)
                                           poll.message = message
                                           _pollsList.push(poll)
                                           await poll.updateVotesAndReacts()
                                           poll.setTimeout()
                                           await poll.updateMessageAndReact()
                                       }
                                   }
                               }
                           }
                       }
                   }
               }))
            }
        }
    }
}

export async function postPoll(poll: Poll, channel: TextChannel): Promise<Message> {
    if(_client) {
        let message = await channel.send({embeds: [poll.embed]})
        message = await channel.messages.fetch(message.id)
        _pollsList.push(poll)
        poll.message = message
        await poll.regenerateReact()
        poll.setTimeout()
        await writePollsInFiles()
        return message
    } else throw Error("Not initialized")
}

export function getPollByMessage(message: Message|PartialMessage): Poll {
    if(_client) return _pollsList.find(poll => poll.message.id === message.id)
    else throw Error("Not initialized")
}

export function removePollInStorage(poll: Poll) {
    if(_pollsList.includes(poll)) {
        _pollsList.splice(_pollsList.indexOf(poll), 1)
        writePollsInFiles().catch(() => {})
    }
}

export {Poll, PollOption}

module.exports = {
    // Class
    Poll: Poll,
    PollOption: PollOption,

    // Function
    postPoll: postPoll,
    getPollByMessage: getPollByMessage,
    init : init
}
