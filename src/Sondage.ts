import {MessageEmbed, Message, MessageReaction, User} from 'discord.js'
import SondageOption from "./SondageOption";
import Utils from "./Utils";
import * as SondageManager from "./index"

export default class Sondage {
    private _title: string
    private _description: string
    private readonly _options: Array<SondageOption>
    private _expireTime: number
    private _expireTimeout: NodeJS.Timeout
    private _message : Message

    constructor(title: string, description = "", options?: Array<SondageOption>, expireTime?: number) {
        this._title = title
        this._description = description
        this._options = (options) ? options : []

        if(expireTime) this._expireTime = expireTime
        else {
            let date = new Date()
            date.setDate(date.getDate()+1)
            this._expireTime = date.getTime()
        }
    }

    set title(title: string) {
        this._title = title
    }

    get title(): string {
        return this._title
    }

    set description(description: string) {
        this._description = description
    }

    get description(): string {
        return this._description
    }

    addOption(option: SondageOption) {
        if(this._options.indexOf(option) === -1) this._options.push(option)
    }

    removeOption(option) {
        if(this._options.indexOf(option) !== -1) this._options.splice(this._options.indexOf(option), 1)
    }

    get options(): Array<SondageOption> {
        return this._options;
    }

    getOptionByEmote(emote: string): SondageOption {
        return this._options.find(option => option.emote === emote)
    }

    resetAllVotes(): void {
        return this._options.forEach(option => option.resetVote())
    }

    get reacts(): Array<string> {
        return this._options.map(option => option.emote)
    }

    set message(message: Message) {
        this._message = message
    }

    get message(): Message {
        return this._message
    }

    async regenerateReact() {
        if(this._message) {
            await this._message.reactions.removeAll()
            for (let react of this.reacts) {
                await this._message.react(react)
            }
        }
    }

    get nbVotes(): number {
        let votes: Array<string> = []

        this._options.forEach(option => {
            option.votes.forEach(vote => {
                if(votes.indexOf(vote) === -1) votes.push(vote)
            })
        })

        return votes.length
    }

    get expired() : boolean {
        let now = new Date()

        return (this._expireTime - now.getTime()) < 1
    }

    get embed(): MessageEmbed {
        let embed = new MessageEmbed()
        let multiple = false

        embed.setTitle(this._title)

        this._options.forEach(option => {
            let nbVoteOfOption = option.nbVotes
            let percent = Utils.calculRoundPercent(nbVoteOfOption, this.nbVotes)

            embed.addField(`${option.emote} ${option.libelle} ${(option.multiOptions) ? ' (*)' : ''}`, `${Utils.generateEmotePercentBar(percent)} (${nbVoteOfOption}/${this.nbVotes})`)

            if(option.multiOptions) multiple = true
        })

        let footer: string
        if(this.expired) footer = 'Terminé'
        else {
            footer = "En cours"
            embed.setColor('#FBFCF7')
        }
        embed.setFooter(`${(multiple) ? "(*) Choix multiples - " : ""}${footer}`)
        embed.setTimestamp(this._expireTime)

        return embed
    }

    async updateMessageAndReact() {
        if(this._message && !this._message.deleted) {
            if(this.expired) {
                await this._message.reactions.removeAll()
                SondageManager.removeSondageInStorage(this)
            }
            await this._message.edit({embeds: [this.embed]}).catch(() => {
                throw Error("Can't edit poll message")
            })
        }
    }

    toJson() {
        return {
            title: this._title,
            description: this._description,
            options: this._options.map(option => option.toJson()),
            guildId: this._message?.guildId || null,
            channelId: this._message?.channelId || null,
            messageId: this._message?.id || null,
            expireTime: this._expireTime
        }
    }

    async vote(memberId: string, emote: string) {
        let option = this.getOptionByEmote(emote)

        let emoteOfVoteToRemove: Array<string> = []

        if(option) {
            option.addVote(memberId)
            this._options.forEach(opt => {
                if(opt !== option && (!option.multiOptions || !opt.multiOptions)) {
                    opt.removeVote(memberId)
                    emoteOfVoteToRemove.push(opt.emote)
                }
            })
        }

        if(emoteOfVoteToRemove.length > 0) {
            let messageReactions: Array<MessageReaction> = this._message.reactions.cache.filter(reaction => reaction.users.cache.has(memberId) && emoteOfVoteToRemove.find(emote => emote === reaction.emoji.name) !== undefined).map((messageReaction) => messageReaction)
            for(let messageReaction of messageReactions) {
                await messageReaction.users.remove(memberId).catch(() => {})
            }
        }
    }

    unVote(memberId: string, emote: string) {
        let option = this.getOptionByEmote(emote)

        if(option) {
            option.removeVote(memberId)
        }
    }

    async updateVotesAndReacts() {
        if(this._message) {
            this.resetAllVotes()

            let messageReactions: Array<MessageReaction> = this._message.reactions.cache.map((messageReaction) => messageReaction)

            for(let messageReaction of messageReactions) {
                let option = this.getOptionByEmote(messageReaction.emoji.name)

                if(option) {
                    let users: Array<User> = []
                    await messageReaction.users.fetch().then(reactions => users = reactions.map((us) => us)).catch(() => {})
                    for(let user of users) {
                        if(!user.bot) {
                            await this.vote(user.id, messageReaction.emoji.name)
                        }
                    }
                } else await messageReaction.remove()
            }
        }
    }

    setTimeout() {
        if(this._message) {
            let now = new Date()
            clearTimeout(this._expireTimeout)
            this._expireTimeout = setTimeout(() => {
                this.updateMessageAndReact().catch(() => {})
            }, this._expireTime - now.getTime())
        }
    }

    set expireTime(expireTime: number) {
        this._expireTime = expireTime
        this.setTimeout()
    }
}
