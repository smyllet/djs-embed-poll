import { MessageEmbed, Message } from 'discord.js';
import PollOption from "./PollOption";
export default class Poll {
    private _title;
    private _description;
    private readonly _options;
    private _expireTime;
    private _expireTimeout;
    private _message;
    constructor(title: string, description?: string, options?: Array<PollOption>, expireTime?: number);
    set title(title: string);
    get title(): string;
    set description(description: string);
    get description(): string;
    addOption(option: PollOption): void;
    removeOption(option: PollOption): void;
    get options(): Array<PollOption>;
    getOptionByEmote(emote: string): PollOption;
    resetAllVotes(): void;
    get reacts(): Array<string>;
    set message(message: Message);
    get message(): Message;
    regenerateReact(): Promise<void>;
    get nbVotes(): number;
    get expired(): boolean;
    get embed(): MessageEmbed;
    updateMessageAndReact(): Promise<void>;
    toJson(): {
        title: string;
        description: string;
        options: {
            emote: string;
            libelle: string;
            multiOptions: boolean;
        }[];
        guildId: string;
        channelId: string;
        messageId: string;
        expireTime: number;
    };
    vote(memberId: string, emote: string): Promise<void>;
    unVote(memberId: string, emote: string): void;
    updateVotesAndReacts(): Promise<void>;
    setTimeout(): void;
    set expireTime(expireTime: number);
}
