export default class Utils {
    static generateEmotePercentBar(percent: number): string {
        let result = ""

        for(let i = 1; i <= 10; i++) {
            if(Math.round(percent/10) >= i) result += '◻'
            else result += '◼'
        }

        return result
    }
}
