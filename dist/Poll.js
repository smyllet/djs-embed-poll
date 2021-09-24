"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Utils_1 = require("./Utils");
const PollManager = require("./index");
class Poll {
    constructor(title, description = "", options, expireTime) {
        this._title = title;
        this._description = description;
        this._options = (options) ? options : [];
        if (expireTime)
            this._expireTime = expireTime;
        else {
            let date = new Date();
            date.setDate(date.getDate() + 1);
            this._expireTime = date.getTime();
        }
    }
    set title(title) {
        this._title = title;
    }
    get title() {
        return this._title;
    }
    set description(description) {
        this._description = description;
    }
    get description() {
        return this._description;
    }
    addOption(option) {
        if (this._options.indexOf(option) === -1)
            this._options.push(option);
    }
    removeOption(option) {
        if (this._options.indexOf(option) !== -1)
            this._options.splice(this._options.indexOf(option), 1);
    }
    get options() {
        return this._options;
    }
    getOptionByEmote(emote) {
        return this._options.find(option => option.emote === emote);
    }
    resetAllVotes() {
        return this._options.forEach(option => option.resetVote());
    }
    get reacts() {
        return this._options.map(option => option.emote);
    }
    set message(message) {
        this._message = message;
    }
    get message() {
        return this._message;
    }
    regenerateReact() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._message) {
                yield this._message.reactions.removeAll();
                for (let react of this.reacts) {
                    yield this._message.react(react);
                }
            }
        });
    }
    get nbVotes() {
        let votes = [];
        this._options.forEach(option => {
            option.votes.forEach(vote => {
                if (votes.indexOf(vote) === -1)
                    votes.push(vote);
            });
        });
        return votes.length;
    }
    get expired() {
        let now = new Date();
        return (this._expireTime - now.getTime()) < 1;
    }
    get embed() {
        let embed = new discord_js_1.MessageEmbed();
        let multiple = false;
        embed.setTitle(this._title);
        if (this.description && this.description.length > 0)
            embed.setDescription(this.description);
        this._options.forEach(option => {
            let nbVoteOfOption = option.nbVotes;
            let percent = Utils_1.default.calculRoundPercent(nbVoteOfOption, this.nbVotes);
            embed.addField(`${option.emote} ${option.libelle} ${(option.multiOptions) ? ' (*)' : ''}`, `${Utils_1.default.generateEmotePercentBar(percent)} ${percent}% (${nbVoteOfOption}/${this.nbVotes})`);
            if (option.multiOptions)
                multiple = true;
        });
        let footer;
        if (this.expired)
            footer = 'Terminé';
        else {
            footer = "En cours";
            embed.setColor('#FBFCF7');
        }
        embed.setFooter(`${(multiple) ? "(*) Choix multiples - " : ""}${footer}`);
        embed.setTimestamp(this._expireTime);
        return embed;
    }
    updateMessageAndReact() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._message && !this._message.deleted) {
                if (this.expired) {
                    yield this._message.reactions.removeAll();
                    PollManager.removePollInStorage(this);
                }
                yield this._message.edit({ embeds: [this.embed] }).catch(() => {
                    throw Error("Can't edit poll message");
                });
            }
        });
    }
    toJson() {
        var _a, _b, _c;
        return {
            title: this._title,
            description: this._description,
            options: this._options.map(option => option.toJson()),
            guildId: ((_a = this._message) === null || _a === void 0 ? void 0 : _a.guildId) || null,
            channelId: ((_b = this._message) === null || _b === void 0 ? void 0 : _b.channelId) || null,
            messageId: ((_c = this._message) === null || _c === void 0 ? void 0 : _c.id) || null,
            expireTime: this._expireTime
        };
    }
    vote(memberId, emote) {
        return __awaiter(this, void 0, void 0, function* () {
            let option = this.getOptionByEmote(emote);
            let emoteOfVoteToRemove = [];
            if (option) {
                option.addVote(memberId);
                this._options.forEach(opt => {
                    if (opt !== option && (!option.multiOptions || !opt.multiOptions)) {
                        opt.removeVote(memberId);
                        emoteOfVoteToRemove.push(opt.emote);
                    }
                });
            }
            if (emoteOfVoteToRemove.length > 0) {
                let messageReactions = this._message.reactions.cache.filter(reaction => reaction.users.cache.has(memberId) && emoteOfVoteToRemove.find(emote => emote === reaction.emoji.name) !== undefined).map((messageReaction) => messageReaction);
                for (let messageReaction of messageReactions) {
                    yield messageReaction.users.remove(memberId).catch(() => { });
                }
            }
        });
    }
    unVote(memberId, emote) {
        let option = this.getOptionByEmote(emote);
        if (option) {
            option.removeVote(memberId);
        }
    }
    updateVotesAndReacts() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._message) {
                this.resetAllVotes();
                let messageReactions = this._message.reactions.cache.map((messageReaction) => messageReaction);
                for (let messageReaction of messageReactions) {
                    let option = this.getOptionByEmote(messageReaction.emoji.name);
                    if (option) {
                        let users = [];
                        yield messageReaction.users.fetch().then(reactions => users = reactions.map((us) => us)).catch(() => { });
                        for (let user of users) {
                            if (!user.bot) {
                                yield this.vote(user.id, messageReaction.emoji.name);
                            }
                        }
                    }
                    else
                        yield messageReaction.remove();
                }
            }
        });
    }
    setTimeout() {
        if (this._message) {
            let now = new Date();
            clearTimeout(this._expireTimeout);
            this._expireTimeout = setTimeout(() => {
                this.updateMessageAndReact().catch(() => { });
            }, this._expireTime - now.getTime());
        }
    }
    set expireTime(expireTime) {
        this._expireTime = expireTime;
        this.setTimeout();
    }
    end() {
        let now = new Date();
        this.expireTime = now.getTime();
    }
}
exports.default = Poll;
