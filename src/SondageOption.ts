export default class SondageOption {
    private readonly _emote: string
    private readonly _libelle: string
    private readonly _multiOptions: boolean
    private _votes: Array<string>

    constructor(emote: string, libelle: string, multiOption = false) {
        this._emote = emote
        this._libelle = libelle
        this._votes = []
        this._multiOptions = multiOption
    }

    get emote(): string {
        return this._emote
    }

    get libelle(): string {
        return this._libelle
    }

    get multiOptions(): boolean {
        return this._multiOptions
    }

    addVote(memberId: string): void {
        if(this._votes.indexOf(memberId) === -1) this._votes.push(memberId)
    }

    removeVote(memberId: string): void {
        if(this._votes.indexOf(memberId) !== -1) this._votes.splice(this._votes.indexOf(memberId), 1)
    }

    resetVote(): void {
        this._votes = []
    }

    get nbVote(): number {
        return this._votes.length
    }
}
