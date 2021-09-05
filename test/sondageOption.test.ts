const assert = require('assert')
import SondageOption from '../src/SondageOption'

describe('Class SondageOption', () => {
    let option1: SondageOption
    let option2: SondageOption

    beforeEach(function(){
        option1 = new SondageOption(':sob:', 'Choix 1')
        option2 = new SondageOption(':cry:', 'Choix 2')

        option2.setNbVote(5)
    });

    describe('up()', () => {
        it('Add 1 vote from an option', () => {
            option1.up()
            assert.strictEqual(option1.getNbVote(), 1)
        })

        it('Add 2x 1 vote from an option', () => {
            option1.up()
            option1.up()
            assert.strictEqual(option1.getNbVote(), 2)
        })

        it('Add 1 vote from an option that has already 5 votes', () => {
            option2.up()
            assert.strictEqual(option2.getNbVote(), 6)
        })
    })

    describe('down()', () => {
        it('Remove 1 vote from an option that has no votes', () => {
            option1.down()
            assert.strictEqual(option1.getNbVote(), 0)
        })

        it('Remove 1 vote from an option', () => {
            option2.down()
            assert.strictEqual(option2.getNbVote(), 4)
        })

        it('Remove 2x 1 vote from an option', () => {
            option2.down()
            option2.down()
            assert.strictEqual(option2.getNbVote(), 3)
        })
    })

    describe('reset()', () => {
        it('Remove all votes from an option that has already 0 vote', () => {
            option1.reset()
            assert.strictEqual(option1.getNbVote(), 0)
        })

        it('Remove all votes from an option', () => {
            option2.reset()
            assert.strictEqual(option2.getNbVote(), 0)
        })
    })

    describe('getEmote', () => {
        it('Get emote from an option', () => {
            assert.strictEqual(option1.getEmote(), ":sob:")
        })

        it('Get emote from an other option', () => {
            assert.strictEqual(option2.getEmote(), ":cry:")
        })
    })

    describe('getLibelle', () => {
        it('Get libelle from an option', () => {
            assert.strictEqual(option1.getLibelle(), "Choix 1")
        })

        it('Get libelle from an other option', () => {
            assert.strictEqual(option2.getLibelle(), "Choix 2")
        })
    })
})
