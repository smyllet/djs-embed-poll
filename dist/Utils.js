"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    static generateEmotePercentBar(percent) {
        let result = "";
        for (let i = 1; i <= 10; i++) {
            if (Math.round(percent / 10) >= i)
                result += '◻';
            else
                result += '◼';
        }
        return result;
    }
    static calculRoundPercent(part, total) {
        if (total < 1)
            return 0;
        else
            return Math.round(part / total * 100);
    }
}
exports.default = Utils;
