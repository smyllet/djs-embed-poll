class SondageOption {
    /** @private
     *  @type {string} */
    emote
    /** @private
     *  @type {string} */
    libelle
    /** @private
     *  @type {int} */
    nbVote

    /** @param {string} emote
     *  @param {string} libelle */
    constructor(emote, libelle) {
        this.emote = emote
        this.libelle = libelle
        this.nbVote = 0
    }

    /** @return {string} emote */
    getEmote() {
        return this.emote
    }

    /** @return {string} libelle */
    getLibelle() {
        return this.libelle
    }

    /** @param {int} nbVote
     *  @return {void} */
    setNbVote(nbVote) {
        this.nbVote = nbVote
    }

    /** @return {int} nbVote */
    getNbVote() {
        return this.nbVote
    }

    /** @return {void} */
    up() {
        this.nbVote++
    }

    /** @return {void} */
    down() {
        if(this.nbVote > 0) this.nbVote--
    }

    /** @return {void} */
    reset() {
        this.nbVote = 0
    }
}

module.exports = SondageOption
