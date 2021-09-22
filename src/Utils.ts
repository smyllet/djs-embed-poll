export default class Utils {
    static generateEmotePercentBar(percent: number): string {
        let result = ""

        for(let i = 1; i <= 10; i++) {
            if(Math.round(percent/10) >= i) result += '◻'
            else result += '◼'
        }

        return result
    }

    static calculRoundPercent(part: number, total: number) : number {
        if(total < 1) return 0
        else return Math.round(part/total*100)
    }
}
