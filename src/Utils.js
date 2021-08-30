class Utils {
    /** @param {int} percent
     *  @return {string} percent */
    static generateEmotePercentBar(percent) {
        let result = ""

        for(let i = 1; i <= 10; i++) {
            if(Math.round(percent/10) >= i) result += '◻'
            else result += '◼'
        }

        return result
    }
}

module.exports = Utils
