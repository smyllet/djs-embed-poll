const assert = require('assert')
import SondageOption from '../src/SondageOption'

describe('Class SondageOption', () => {
    let option1: SondageOption
    let option2: SondageOption

    beforeEach(function(){
        option1 = new SondageOption(':sob:', 'Choix 1')
        option2 = new SondageOption(':cry:', 'Choix 2', true)

        option2.addVote("001")
        option2.addVote("002")
        option2.addVote("003")
        option2.addVote("004")
        option2.addVote("005")
    });

    describe('addVote()', () => {
        it('Add 1 vote from an option', () => {
            option1.addVote("001")
            assert.strictEqual(option1.nbVotes, 1)
        })

        it('Add 2 votes from an option', () => {
            option1.addVote("001")
            option1.addVote("002")
            assert.strictEqual(option1.nbVotes, 2)
        })

        it('Add 1 already existe vote from an option', () => {
            option2.addVote("001")
            assert.strictEqual(option2.nbVotes, 5)
        })
    })

    describe('removeVote()', () => {
        it('Remove 1 vote from an option that has no votes', () => {
            option1.removeVote("001")
            assert.strictEqual(option1.nbVotes, 0)
        })

        it('Remove 1 vote from an option', () => {
            option2.removeVote("001")
            assert.strictEqual(option2.nbVotes, 4)
        })

        it('Remove 2 vote from an option', () => {
            option2.removeVote("002")
            option2.removeVote("003")
            assert.strictEqual(option2.nbVotes, 3)
        })

        it('Remove no existing vote from an option', () => {
            option2.removeVote("006")
            assert.strictEqual(option2.nbVotes, 5)
        })
    })

    describe('resetVote()', () => {
        it('Remove all votes from an option that has already 0 vote', () => {
            option1.resetVote()
            assert.strictEqual(option1.nbVotes, 0)
        })

        it('Remove all votes from an option', () => {
            option2.resetVote()
            assert.strictEqual(option2.nbVotes, 0)
        })
    })

    describe('get emote', () => {
        it('Get emote from an option', () => {
            assert.strictEqual(option1.emote, ":sob:")
        })

        it('Get emote from an other option', () => {
            assert.strictEqual(option2.emote, ":cry:")
        })
    })

    describe('get libelle', () => {
        it('Get libelle from an option', () => {
            assert.strictEqual(option1.libelle, "Choix 1")
        })

        it('Get libelle from an other option', () => {
            assert.strictEqual(option2.libelle, "Choix 2")
        })
    })

    describe('get multiOptions', () => {
        it('Get multiOptions from an option', () => {
            assert.strictEqual(option1.multiOptions, false)
        })

        it('Get multiOptions from an other option', () => {
            assert.strictEqual(option2.multiOptions, true)
        })
    })
})
