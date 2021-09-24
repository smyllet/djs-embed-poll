export default class PollOption {
    private readonly _emote;
    private readonly _libelle;
    private readonly _multiOptions;
    private _votes;
    constructor(emote: string, libelle: string, multiOption?: boolean);
    get emote(): string;
    get libelle(): string;
    get multiOptions(): boolean;
    addVote(memberId: string): void;
    removeVote(memberId: string): void;
    resetVote(): void;
    get votes(): Array<string>;
    get nbVotes(): number;
    toJson(): {
        emote: string;
        libelle: string;
        multiOptions: boolean;
    };
}
