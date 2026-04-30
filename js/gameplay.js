var Gameplay = (function () {

  function createWordState(word) {
    return {
      word: word,
      index: 0,
      correctCount: 0,
      wrongCount: 0,
      complete: false,
      lastWrong: false
    };
  }

  function handleKeypress(wordState, key) {
    if (wordState.complete) return wordState;
    var expected = wordState.word[wordState.index];
    if (key.toLowerCase() === expected.toLowerCase()) {
      var newIndex = wordState.index + 1;
      return Object.assign({}, wordState, {
        index: newIndex,
        correctCount: wordState.correctCount + 1,
        complete: newIndex === wordState.word.length,
        lastWrong: false
      });
    } else {
      return Object.assign({}, wordState, {
        wrongCount: wordState.wrongCount + 1,
        lastWrong: true
      });
    }
  }

  function calculateAccuracy(correct, wrong) {
    var total = correct + wrong;
    if (total === 0) return 0;
    return correct / total;
  }

  var session = null;

  function getSession() { return session; }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createWordState, handleKeypress, calculateAccuracy };
  }

  return { createWordState, handleKeypress, calculateAccuracy, getSession };
})();
