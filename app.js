window.app = (function () {

  function init () {
    // input default text
    $('textarea#textinput').val(window.exampleCopy);

    $('button#run').click(function () {
      run($('textarea#textinput').val());
    });
  }

  function output () {
    var outputLength = parseInt($('input#wordcount').val()),
        outputString = "";

    for (var i = 0; i < outputLength; i++) {
      outputString += "a";
    }

    $('textarea#textoutput').val(outputString);
  }

  /* Takes an array of strings and generates an array of unique words (again strings)
     appearing in the argument string. */
  function generateUniqueWordArray (inputWords) {
    return inputWords.reduce(function (previousWords, word, wordIndex, inputWords) {
      if (previousWords.indexOf(word) === -1) {
        previousWords.push(word);
      }
      return previousWords;
    }, []);
  }

  function run (textInput) {
    var wordArray = splitTextInputIntoWords(textInput),
        uniqueWordArray = generateUniqueWordArray(wordArray),
        numberOfInputs = 3,
        numberOfOutputs = uniqueWordArray.length,
        numberOfHiddenNeurons = uniqueWordArray.length / 2, // experiment with this
        numberOfHiddenLayers = 1, // usually the best default
        weightRange = [-0.5, 0.5],
        network = initialiseNeuronalNetwork (numberOfInputs, numberOfOutputs, numberOfHiddenNeurons, numberOfHiddenLayers, weightRange);

    // train network; start by selecting the first word (i = 1)
    for (var i = 1; i <= wordArray.length; i++) {
      var wordInput = getWordsForCurrentIteration(wordArray, numberOfInputs, i);
      trainNetwork(network, wordInput);
    }
    console.log(wordArray.length);
    console.log(uniqueWordArray.length);
    // output on html page
    output();
  }

  /* Initialises the neuronal network.
     Returns an array of arrays where the latter represent the network layers. */
  function initialiseNeuronalNetwork (numberOfInputs, numberOfOutputs, numberOfHiddenNeurons, numberOfHiddenLayers, weightRange) {

  }

  /*
   * Executes one epoch of training the network.
   *
   * Arguments:
   *  - networkLayers: an array of network layers (again arrays) which will be changed as part of the training process (side effects)
   *  - wordArray: an array of the text input with periods occuring as words of their own, other punctuation marks removed
   *  - numberOfInputs: the number of words that should be considered to train and trigger the network
   *  - iteration: the training iteration/epoch; equals the word position in wordArray that the epoch is focused on
   */
  function trainNetwork (networkLayers, wordInput) {
    // console.log(wordInput);
  }

  /*
   * Returns an array of w words out of an array with i being the last word of the array and w words preceding the last word.
   * Handles the following edge cases:
   *  - fills up the returned array with empty words (empty strings) in case (i - w) is smaller than zero
   *  - splits punctuation characters at the end of words into words of its own
   *
   * Returns an array of strings.
   */
  function getWordsForCurrentIteration (wordArray, w, i) {
    var result = [];

    // handle edge case when i is at the beginning of wordArray
    if (i <= w) {
      // fill up non-existent words with empty strings
      for (var c = 0; c < w - i; c++) {
        result.push("");
      }
      // select words from wordArray for words that do exist in wordArray
      for (var c = 0; c < i ; c++) {
        result.push(wordArray[c]);
      }
    } // normal slicing
    else {
      result = wordArray.slice(i - w, i);
    }

    return result;
  }

  /* Splits a string into words with punctuation marks occuring on their own.
   * Returns an array of strings. */
  function splitTextInputIntoWords (textInput) {
    return textInput.split(/\b/).filter(function (word) {
      return word.match(/\S/); // filter out whitespace
    });
  }

  return {
    init: init
  };
})();

window.app.init();
