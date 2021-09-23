import Sondage from './Sondage'
import SondageOption from "./SondageOption"
import {TextChannel, Message, Client, PartialMessage} from "discord.js"
import * as fs from "fs";

let _sondagesList: Array<Sondage> = []
let _client: Client
let _pathToSondageSaveFile: string

/** Initialise Sondage Management
 *  @param {Client} client
 *  @param {string} pathToSondageSaveFile */
async function init(client: Client, pathToSondageSaveFile: string) {
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
    _pathToSondageSaveFile = pathToSondageSaveFile

    await loadSondagesFromFile().then(() => {
        writeSondagesInFiles()
    }).catch((e) => {
        throw Error(e.message)
    })

    client.on('messageReactionAdd', (messageReaction, user) => {
        let sondage = getSondageByMessage(messageReaction.message);
        if(sondage && !user.bot) {
            sondage.vote(user.id, messageReaction.emoji.name)
            sondage.updateMessageAndReact()
        }
    })

    client.on('messageReactionRemove', (messageReaction, user) => {
        let sondage = getSondageByMessage(messageReaction.message);
        if(sondage && !user.bot) {
            sondage.unVote(user.id, messageReaction.emoji.name)
            sondage.updateMessageAndReact()
        }
    })

    client.on('messageReactionRemoveAll', async (message) => {
        let sondage = getSondageByMessage(message);
        if(sondage) {
            await sondage.updateMessageAndReact()
        }
    })

    client.on('messageDelete', async (message) => {
        let sondage = getSondageByMessage(message);
        if(sondage) {
            await removeSondageInStorage(sondage)
        }
    })
}

/** Save all sondage in sondage data file */
async function writeSondagesInFiles() {
    let data = {
        sondageList: _sondagesList.map(sondage => sondage.toJson())
    }

    try {
        fs.writeFileSync(_pathToSondageSaveFile, JSON.stringify(data, null, "\t"))
    } catch (e) {
        throw Error("Error during saving sondages")
    }
}

/** Load all sondage from sondage data file */
async function loadSondagesFromFile() {
    _sondagesList = []

    if(fs.existsSync(_pathToSondageSaveFile)) {
        let sondageFile

        try {
            sondageFile = fs.readFileSync(_pathToSondageSaveFile, 'utf-8')
        } catch (e) {
            throw Error("Error while loading polls")
        }

        if(sondageFile) {
            let sondagesJson = JSON.parse(sondageFile)
            if(sondagesJson.sondageList && sondagesJson.sondageList instanceof Array) {
                await Promise.all(sondagesJson.sondageList.map(async jsonSondage => {
                   if(
                       jsonSondage.title && jsonSondage.title.length > 0 &&
                       jsonSondage.description &&
                       jsonSondage.expireTime
                   ) {
                       let sondagesOptionsList: Array<SondageOption> = []
                       if(jsonSondage.options && jsonSondage.options instanceof Array && jsonSondage.options.length >= 2) {
                           jsonSondage.options.forEach(jsonSondageOption => {
                               if(
                                   jsonSondageOption.emote &&
                                   jsonSondageOption.libelle && jsonSondageOption.libelle.length > 0 &&
                                   jsonSondageOption.hasOwnProperty("multiOptions") && typeof jsonSondageOption.multiOptions == "boolean"
                               ) {
                                   sondagesOptionsList.push(new SondageOption(jsonSondageOption.emote, jsonSondageOption.libelle, jsonSondageOption.multiOptions))
                               }
                           })

                           if(sondagesOptionsList.length >= 2) {
                               let guild = await _client.guilds.fetch(jsonSondage.guildId).catch(() => {})
                               if(guild) {
                                   let channel = await guild.channels.fetch(jsonSondage.channelId).catch(() => {})
                                   if(channel && channel.isText()) {
                                       let message = await channel.messages.fetch(jsonSondage.messageId).catch(() => {})
                                       if(message && message.author === _client.user) {
                                           let sondage = new Sondage(jsonSondage.title, jsonSondage.description, sondagesOptionsList, jsonSondage.expireTime)
                                           sondage.message = message
                                           _sondagesList.push(sondage)
                                           await sondage.updateVotesAndReacts()
                                           sondage.setTimeout()
                                           await sondage.updateMessageAndReact()
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

/** post in channel and save a sondage
 *  @param {Sondage} sondage
 *  @param {TextChannel} channel */
async function postSondage(sondage: Sondage, channel: TextChannel): Promise<Message> {
    if(_client) {
        let message = await channel.send({embeds: [sondage.embed]})
        message = await channel.messages.fetch(message.id)
        _sondagesList.push(sondage)
        sondage.message = message
        await sondage.regenerateReact()
        sondage.setTimeout()
        await writeSondagesInFiles()
        return message
    } else throw Error("Not initialized")
}

/** get a sondage through the message it is associated with
 *  @param {Message|PartialMessage} message */
function getSondageByMessage(message: Message|PartialMessage): Sondage {
    if(_client) return _sondagesList.find(sondage => sondage.message.id === message.id)
    else throw Error("Not initialized")
}

/** Remove sondage from storage (WARNING : sondage does not end)
 *  @param {Sondage} sondage */
export function removeSondageInStorage(sondage: Sondage) {
    if(_sondagesList.includes(sondage)) {
        _sondagesList.splice(_sondagesList.indexOf(sondage), 1)
        writeSondagesInFiles().catch(() => {})
    }
}

module.exports = {
    // Class
    Sondage: Sondage,
    SondageOption: SondageOption,

    // Function
    postSondage: postSondage,
    getSondageByMessage: getSondageByMessage,
    init : init
}
