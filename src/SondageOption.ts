export default class SondageOption {
    private readonly _emote: string
    private readonly _libelle: string
    private readonly _multiOptions: boolean
    private _votes: Array<string>

    /** @param {string} emote
     *  @param {string} libelle
     *  @param {boolean} multiOption */
    constructor(emote: string, libelle: string, multiOption = false) {
        this._emote = emote
        this._libelle = libelle
        this._votes = []
        this._multiOptions = multiOption
    }

    /** @return {string} */
    get emote(): string {
        return this._emote
    }

    /** @return {string} */
    get libelle(): string {
        return this._libelle
    }

    /** @return {boolean} */
    get multiOptions(): boolean {
        return this._multiOptions
    }

    /** @param {string} memberId */
    addVote(memberId: string): void {
        if(this._votes.indexOf(memberId) === -1) this._votes.push(memberId)
    }

    /** @param {string} memberId */
    removeVote(memberId: string): void {
        if(this._votes.indexOf(memberId) !== -1) this._votes.splice(this._votes.indexOf(memberId), 1)
    }

    resetVote(): void {
        this._votes = []
    }

    /** @return {Array<string>} */
    get votes() : Array<string> {
        return this._votes
    }

    /** @return {number} */
    get nbVotes(): number {
        return this._votes.length
    }

    toJson() {
        return {
            emote: this._emote,
            libelle: this._libelle,
            multiOptions: this._multiOptions
        }
    }
}
