"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SondageOption {
    constructor(emote, libelle, multiOption = false) {
        this._emote = emote;
        this._libelle = libelle;
        this._votes = [];
        this._multiOptions = multiOption;
    }
    get emote() {
        return this._emote;
    }
    get libelle() {
        return this._libelle;
    }
    get multiOptions() {
        return this._multiOptions;
    }
    addVote(memberId) {
        if (this._votes.indexOf(memberId) === -1)
            this._votes.push(memberId);
    }
    removeVote(memberId) {
        if (this._votes.indexOf(memberId) !== -1)
            this._votes.splice(this._votes.indexOf(memberId), 1);
    }
    resetVote() {
        this._votes = [];
    }
    get votes() {
        return this._votes;
    }
    get nbVotes() {
        return this._votes.length;
    }
    toJson() {
        return {
            emote: this._emote,
            libelle: this._libelle,
            multiOptions: this._multiOptions
        };
    }
}
exports.default = SondageOption;
