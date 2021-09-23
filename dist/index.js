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
exports.removeSondageInStorage = void 0;
const Sondage_1 = require("./Sondage");
const SondageOption_1 = require("./SondageOption");
const fs = require("fs");
let _sondagesList = [];
let _client;
let _pathToSondageSaveFile;
function init(client, pathToSondageSaveFile) {
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
        _pathToSondageSaveFile = pathToSondageSaveFile;
        yield loadSondagesFromFile().then(() => {
            writeSondagesInFiles();
        }).catch((e) => {
            throw Error(e.message);
        });
        client.on('messageReactionAdd', (messageReaction, user) => {
            let sondage = getSondageByMessage(messageReaction.message);
            if (sondage && !user.bot) {
                sondage.vote(user.id, messageReaction.emoji.name);
                sondage.updateMessageAndReact();
            }
        });
        client.on('messageReactionRemove', (messageReaction, user) => {
            let sondage = getSondageByMessage(messageReaction.message);
            if (sondage && !user.bot) {
                sondage.unVote(user.id, messageReaction.emoji.name);
                sondage.updateMessageAndReact();
            }
        });
        client.on('messageReactionRemoveAll', (message) => __awaiter(this, void 0, void 0, function* () {
            let sondage = getSondageByMessage(message);
            if (sondage) {
                yield sondage.updateMessageAndReact();
            }
        }));
        client.on('messageDelete', (message) => __awaiter(this, void 0, void 0, function* () {
            let sondage = getSondageByMessage(message);
            if (sondage) {
                yield removeSondageInStorage(sondage);
            }
        }));
    });
}
function writeSondagesInFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = {
            sondageList: _sondagesList.map(sondage => sondage.toJson())
        };
        try {
            fs.writeFileSync(_pathToSondageSaveFile, JSON.stringify(data, null, "\t"));
        }
        catch (e) {
            throw Error("Error during saving sondages");
        }
    });
}
function loadSondagesFromFile() {
    return __awaiter(this, void 0, void 0, function* () {
        _sondagesList = [];
        if (fs.existsSync(_pathToSondageSaveFile)) {
            let sondageFile;
            try {
                sondageFile = fs.readFileSync(_pathToSondageSaveFile, 'utf-8');
            }
            catch (e) {
                throw Error("Error while loading polls");
            }
            if (sondageFile) {
                let sondagesJson = JSON.parse(sondageFile);
                if (sondagesJson.sondageList && sondagesJson.sondageList instanceof Array) {
                    yield Promise.all(sondagesJson.sondageList.map((jsonSondage) => __awaiter(this, void 0, void 0, function* () {
                        if (jsonSondage.title && jsonSondage.title.length > 0 &&
                            jsonSondage.description &&
                            jsonSondage.expireTime) {
                            let sondagesOptionsList = [];
                            if (jsonSondage.options && jsonSondage.options instanceof Array && jsonSondage.options.length >= 2) {
                                jsonSondage.options.forEach(jsonSondageOption => {
                                    if (jsonSondageOption.emote &&
                                        jsonSondageOption.libelle && jsonSondageOption.libelle.length > 0 &&
                                        jsonSondageOption.hasOwnProperty("multiOptions") && typeof jsonSondageOption.multiOptions == "boolean") {
                                        sondagesOptionsList.push(new SondageOption_1.default(jsonSondageOption.emote, jsonSondageOption.libelle, jsonSondageOption.multiOptions));
                                    }
                                });
                                if (sondagesOptionsList.length >= 2) {
                                    let guild = yield _client.guilds.fetch(jsonSondage.guildId).catch(() => { });
                                    if (guild) {
                                        let channel = yield guild.channels.fetch(jsonSondage.channelId).catch(() => { });
                                        if (channel && channel.isText()) {
                                            let message = yield channel.messages.fetch(jsonSondage.messageId).catch(() => { });
                                            if (message && message.author === _client.user) {
                                                let sondage = new Sondage_1.default(jsonSondage.title, jsonSondage.description, sondagesOptionsList, jsonSondage.expireTime);
                                                sondage.message = message;
                                                _sondagesList.push(sondage);
                                                yield sondage.updateVotesAndReacts();
                                                sondage.setTimeout();
                                                yield sondage.updateMessageAndReact();
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
function postSondage(sondage, channel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (_client) {
            let message = yield channel.send({ embeds: [sondage.embed] });
            message = yield channel.messages.fetch(message.id);
            _sondagesList.push(sondage);
            sondage.message = message;
            yield sondage.regenerateReact();
            sondage.setTimeout();
            yield writeSondagesInFiles();
            return message;
        }
        else
            throw Error("Not initialized");
    });
}
function getSondageByMessage(message) {
    if (_client)
        return _sondagesList.find(sondage => sondage.message.id === message.id);
    else
        throw Error("Not initialized");
}
function removeSondageInStorage(sondage) {
    if (_sondagesList.includes(sondage)) {
        _sondagesList.splice(_sondagesList.indexOf(sondage), 1);
        writeSondagesInFiles().catch(() => { });
    }
}
exports.removeSondageInStorage = removeSondageInStorage;
module.exports = {
    // Class
    Sondage: Sondage_1.default,
    SondageOption: SondageOption_1.default,
    // Function
    postSondage: postSondage,
    getSondageByMessage: getSondageByMessage,
    init: init
};
