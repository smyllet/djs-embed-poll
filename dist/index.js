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
exports.PollOption = exports.Poll = exports.removePollInStorage = exports.getPollByMessage = exports.postPoll = exports.loadPollsFromFile = exports.writePollsInFiles = exports.init = void 0;
const Poll_1 = require("./Poll");
exports.Poll = Poll_1.default;
const PollOption_1 = require("./PollOption");
exports.PollOption = PollOption_1.default;
const fs = require("fs");
let _pollsList = [];
let _client;
let _pathToPollsSaveFile;
function init(client, pathToPollsSaveFile) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve, reject) => {
            if (client.isReady())
                resolve();
            client.once("error", reject);
            client.once("ready", () => {
                client.off("error", reject);
                resolve();
            });
        }).catch(() => {
            throw Error("Error during initialization");
        });
        _client = client;
        _pathToPollsSaveFile = pathToPollsSaveFile;
        yield loadPollsFromFile().then(() => {
            writePollsInFiles();
        }).catch((e) => {
            throw Error(e.message);
        });
        client.on('messageReactionAdd', (messageReaction, user) => {
            let poll = getPollByMessage(messageReaction.message);
            if (poll && !user.bot) {
                poll.vote(user.id, messageReaction.emoji.name);
                poll.updateMessageAndReact();
            }
        });
        client.on('messageReactionRemove', (messageReaction, user) => {
            let poll = getPollByMessage(messageReaction.message);
            if (poll && !user.bot) {
                poll.unVote(user.id, messageReaction.emoji.name);
                poll.updateMessageAndReact();
            }
        });
        client.on('messageReactionRemoveAll', (message) => __awaiter(this, void 0, void 0, function* () {
            let poll = getPollByMessage(message);
            if (poll) {
                yield poll.updateMessageAndReact();
            }
        }));
        client.on('messageDelete', (message) => __awaiter(this, void 0, void 0, function* () {
            let poll = getPollByMessage(message);
            if (poll) {
                yield removePollInStorage(poll);
            }
        }));
    });
}
exports.init = init;
function writePollsInFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = {
            pollsList: _pollsList.map(poll => poll.toJson())
        };
        try {
            fs.writeFileSync(_pathToPollsSaveFile, JSON.stringify(data, null, "\t"));
        }
        catch (e) {
            throw Error("Error during saving polls");
        }
    });
}
exports.writePollsInFiles = writePollsInFiles;
function loadPollsFromFile() {
    return __awaiter(this, void 0, void 0, function* () {
        _pollsList = [];
        if (fs.existsSync(_pathToPollsSaveFile)) {
            let pollsFile;
            try {
                pollsFile = fs.readFileSync(_pathToPollsSaveFile, 'utf-8');
            }
            catch (e) {
                throw Error("Error while loading polls");
            }
            if (pollsFile) {
                let pollsJson = JSON.parse(pollsFile);
                if (pollsJson.pollsList && pollsJson.pollsList instanceof Array) {
                    yield Promise.all(pollsJson.pollsList.map((jsonPolls) => __awaiter(this, void 0, void 0, function* () {
                        if (jsonPolls.title && jsonPolls.title.length > 0 &&
                            jsonPolls.description &&
                            jsonPolls.expireTime) {
                            let pollsOptionsList = [];
                            if (jsonPolls.options && jsonPolls.options instanceof Array && jsonPolls.options.length >= 2) {
                                jsonPolls.options.forEach(jsonPollOption => {
                                    if (jsonPollOption.emote &&
                                        jsonPollOption.libelle && jsonPollOption.libelle.length > 0 &&
                                        jsonPollOption.hasOwnProperty("multiOptions") && typeof jsonPollOption.multiOptions == "boolean") {
                                        pollsOptionsList.push(new PollOption_1.default(jsonPollOption.emote, jsonPollOption.libelle, jsonPollOption.multiOptions));
                                    }
                                });
                                if (pollsOptionsList.length >= 2) {
                                    let guild = yield _client.guilds.fetch(jsonPolls.guildId).catch(() => { });
                                    if (guild) {
                                        let channel = yield guild.channels.fetch(jsonPolls.channelId).catch(() => { });
                                        if (channel && channel.isText()) {
                                            let message = yield channel.messages.fetch(jsonPolls.messageId).catch(() => { });
                                            if (message && message.author === _client.user) {
                                                let poll = new Poll_1.default(jsonPolls.title, jsonPolls.description, pollsOptionsList, jsonPolls.expireTime);
                                                poll.message = message;
                                                _pollsList.push(poll);
                                                yield poll.updateVotesAndReacts();
                                                poll.setTimeout();
                                                yield poll.updateMessageAndReact();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })));
                }
            }
        }
    });
}
exports.loadPollsFromFile = loadPollsFromFile;
function postPoll(poll, channel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (_client) {
            let message = yield channel.send({ embeds: [poll.embed] });
            message = yield channel.messages.fetch(message.id);
            _pollsList.push(poll);
            poll.message = message;
            yield poll.regenerateReact();
            poll.setTimeout();
            yield writePollsInFiles();
            return message;
        }
        else
            throw Error("Not initialized");
    });
}
exports.postPoll = postPoll;
function getPollByMessage(message) {
    if (_client)
        return _pollsList.find(poll => poll.message.id === message.id);
    else
        throw Error("Not initialized");
}
exports.getPollByMessage = getPollByMessage;
function removePollInStorage(poll) {
    if (_pollsList.includes(poll)) {
        _pollsList.splice(_pollsList.indexOf(poll), 1);
        writePollsInFiles().catch(() => { });
    }
}
exports.removePollInStorage = removePollInStorage;
module.exports = {
    Poll: Poll_1.default,
    PollOption: PollOption_1.default,
    postPoll: postPoll,
    getPollByMessage: getPollByMessage,
    init: init
};
