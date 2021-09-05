export default class SondageOption {
    private readonly emote: string
    private readonly libelle: string
    private nbVote: number

    constructor(emote: string, libelle: string) {
        this.emote = emote
        this.libelle = libelle
        this.nbVote = 0
    }

    getEmote(): string {
        return this.emote
    }

    getLibelle(): string {
        return this.libelle
    }

    setNbVote(nbVote: number): void {
        this.nbVote = nbVote
    }

    getNbVote(): number {
        return this.nbVote
    }

    up(): void {
        this.nbVote++
    }

    down(): void {
        if(this.nbVote > 0) this.nbVote--
    }

    reset(): void {
        this.nbVote = 0
    }
}
