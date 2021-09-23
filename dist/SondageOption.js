"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SondageOption {
    /** @param {string} emote
     *  @param {string} libelle
     *  @param {boolean} multiOption */
    constructor(emote, libelle, multiOption = false) {
        this._emote = emote;
        this._libelle = libelle;
        this._votes = [];
        this._multiOptions = multiOption;
    }
    /** @return {string} */
    get emote() {
        return this._emote;
    }
    /** @return {string} */
    get libelle() {
        return this._libelle;
    }
    /** @return {boolean} */
    get multiOptions() {
        return this._multiOptions;
    }
    /** @param {string} memberId */
    addVote(memberId) {
        if (this._votes.indexOf(memberId) === -1)
            this._votes.push(memberId);
    }
    /** @param {string} memberId */
    removeVote(memberId) {
        if (this._votes.indexOf(memberId) !== -1)
            this._votes.splice(this._votes.indexOf(memberId), 1);
    }
    resetVote() {
        this._votes = [];
    }
    /** @return {Array<string>} */
    get votes() {
        return this._votes;
    }
    /** @return {number} */
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
