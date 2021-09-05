const assert = require('assert')
import Utils from '../src/Utils';

describe('Class Utils', () => {
    describe('generateEmotePercentBar()', () => {
        it('Generate 0% percent bar', () => {
            assert.strictEqual(Utils.generateEmotePercentBar(0), "◼◼◼◼◼◼◼◼◼◼")
        })

        it('Generate 100% percent bar', () => {
            assert.strictEqual(Utils.generateEmotePercentBar(100), "◻◻◻◻◻◻◻◻◻◻")
        })

        it('Generate 50% percent bar', () => {
            assert.strictEqual(Utils.generateEmotePercentBar(50), "◻◻◻◻◻◼◼◼◼◼")
        })

        it('Generate 57% percent bar', () => {
            assert.strictEqual(Utils.generateEmotePercentBar(57), "◻◻◻◻◻◻◼◼◼◼")
        })

        it('Generate 53% percent bar', () => {
            assert.strictEqual(Utils.generateEmotePercentBar(53), "◻◻◻◻◻◼◼◼◼◼")
        })
    })
})
