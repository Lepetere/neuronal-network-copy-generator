window.app = (function () {

  function init () {
    // input default text
    $('textarea#textinput').val(window.exampleCopy);

    $('button#run').click(function () {
      run($('textarea#textinput').val());
    });
  }

  /* Takes a string and generates an array of unique words (again strings)
     appearing in the argument string. */
  function generateUniqueWordArray (textInput) {
    return [];
  }

  function run (textInput) {
    // var uniqueWordArray = generateUniqueWordArray(textInput),
    //     wordArray = splitTextInputIntoWords(textInput),
    //     numberOfInputs = 2,
    //     numberOfOutputs = uniqueWordArray.length,
    //     numberOfHiddenNeurons = uniqueWordArray.length / 2, // experiment with this
    //     numberOfHiddenLayers = 1, // usually the best default
    //     weightRange = [-0.5, 0.5],
    //     network = initialiseNeuronalNetwork (numberOfInputs, numberOfOutputs, numberOfHiddenNeurons, numberOfHiddenLayers, weightRange);
    console.log(splitTextInputIntoWords(textInput));
    // train network
    // for (var i = 0; i < splitTextInputIntoWords.length; i++) {
    //   trainNetwork(network, wordArray, numberOfInputs);
    // }
  }

  /* Initialises the neuronal network.
     Returns an array of arrays where the latter represent the network layers. */
  function initialiseNeuronalNetwork (numberOfInputs, numberOfOutputs, numberOfHiddenNeurons, numberOfHiddenLayers, weightRange) {

  }

  /* Splits a string into words with periods occuring as words of their own, other punctuation marks removed.
   * Returns an array of strings. */
  function splitTextInputIntoWords (textInput) {
    return textInput.split(/[\s\-]+/);
  }

  /*
   * Executes one epoch of training the network.
   *
   * Arguments:
   *  - networkLayers: an array of network layers (again arrays) which will be changed as part of the training process (side effects)
   *  - wordArray: an array of the text input with periods occuring as words of their own, other punctuation marks removed
   *  - numberOfInputs: the number of words that should be considered to train and trigger the network
   */
  function trainNetwork (networkLayers, wordArray, numberOfInputs) {

  }

  return {
    init: init
  };
})();

window.app.init();
