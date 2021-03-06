window.app = (function () {

  function init () {
    // input default text
    $('textarea#textinput').val(window.exampleCopy);
    $('input#wordcount').val(1);

    $('button#run').click(function () {
      run($('textarea#textinput').val());
    });
  }

  function getWordCount () {
    return parseInt($('input#wordcount').val());
  }

  function setWordOutput (outputString) {
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
        numberOfUniqueWords = uniqueWordArray.length,
        numberOfInputs = 3, // how many words are used to train the network; this includes the output word plus numberOfInputs - 1 preceding words
        numberOfHiddenLayers = 1, // 1 is usually the best default
        numberOfHiddenNeurons = Math.round(uniqueWordArray.length / 2), // experiment with this
        weightRange = [0, 1],
        learningRate = 0.2, // experiment with this
        network = initialiseNeuronalNetwork(numberOfUniqueWords, numberOfInputs, numberOfHiddenLayers, numberOfHiddenNeurons, weightRange);

    // train network; start by selecting the first word (i = 1)
    for (let i = 1; i <= wordArray.length; i++) {
      let wordInput = getWordsForCurrentIteration(wordArray, numberOfInputs, i);
      trainNetwork(network, uniqueWordArray, wordInput, learningRate, i);
    }

    // artificially generate text and output it on html page
    var outputWords = [];
    for (let i = getWordCount(); i > 0; i --) {
      let arrayOfLastWords = getWordsForCurrentIteration(outputWords, numberOfInputs - 1, outputWords.length);
      outputWords.push(uniqueWordArray[makePrediction(network, uniqueWordArray, arrayOfLastWords)]);
    }
    setWordOutput(outputWords.join(" "));
  }

  /* Initialises the neuronal network.
   * Returns an array of arrays of arrays of weights within the bounds of [weightRange].
   *  1st array: the layers of the network
   *  2nd array: a number of arrays that represent the input/output words
   *  3rd array: contain the weights of those words'/nodes' connections to other words/nodes
   */
  function initialiseNeuronalNetwork (numberOfUniqueWords, numberOfInputs, numberOfHiddenLayers, numberOfHiddenNeurons, weightRange) {
    var network = [];

    // Intialise network with random weights between [weightRange]
    for (var l = 0; l < numberOfHiddenLayers + 1 /* +1 for input layer */; l++) {
      var layer = [],
          numberOfNeurons = l === 0 ? numberOfUniqueWords : numberOfHiddenNeurons,
          numberOfConnections = l === numberOfHiddenLayers ? numberOfUniqueWords : numberOfHiddenNeurons;

      for (var n = 0; n < numberOfNeurons; n++) {
        var connections = []; // the connections of one neuron to the next layer
        for (var c = 0; c < numberOfConnections; c++) {
          connections.push(activationFunction(Math.random.apply(weightRange), 1));
        }
        layer.push(connections);
      }

      network.push(layer);
    }

    return network;
  }

  /*
   * Executes one iteration of training the network.
   * Side effect: alters the network permanently.
   *
   * Arguments:
   *  - network: an array of network layers (again arrays) which will be changed as part of the training process (side effects)
   *  - wordArray: an array of the text input with periods occuring as words of their own, other punctuation marks removed
   *  - learningRate: a factor between 0 and 1 that determines how fast the network should adapt to the learning input
   *  - iteration: the training iteration; equals the word position in uniqueWordArray that the iteration is focused on
   */
  function trainNetwork (network, uniqueWordArray, wordInput, learningRate, iteration) {
    // 1st step: calculate network output by feeding in preceding words
    const precedingWords = cutLastWord(wordInput);
    const prediction = calculateOutput(network, uniqueWordArray, precedingWords);

    // 2nd step: feed the error back into the network
    //  --> weigh up the weights leading to the desired output word
    //  --> weigh down the weights leading to the wrongly calculated output word
    //  --> do nothing if the predicted output is the same as the actual output

    // iterate through the network layers from the back
    if (iteration !== prediction) {
      for (let l = network.length - 1; l >= 0; l--) {
        let layer = network[l];
        for (let n = 0; n < network[l].length; n++) {
          // subtract the learningRate from the weights leading to the wrong answer, add it to the weights leading to the correct one
          // divide by network depth from the back & round off using activation function
          layer[n][iteration] =+ (learningRate / (network.length - l));
          layer[n][prediction] =- (learningRate / (network.length - l));
        }
      }
    } // TODO: increase weights if the prediction was already correct
  }

  /*
   * Runs an input of words through the network to calculate the activation pattern on the output layer.
   */
  function calculateOutput (network, uniqueWordArray, precedingWords) {
    // 1st step: match the precedingWords input to the uniqueWordArray to find out which input neurons should be activated
    // generate an array of the form [0, 0, 1, 0, ...] that represents the input signal and that later can be multiplied by the network weights
    const inputSignal = [];
    for (let i = 0; i < uniqueWordArray.length; i++) {
      let isMatch = false;
      for (let w = 0; w < precedingWords.length; w++) {
        if (uniqueWordArray[i] === precedingWords[w]) {
          isMatch = true;
        }
      }
      inputSignal.push(isMatch ? 1 : 0);
    }

    // 2nd step: pass the input signals through the network and determine output
    return network.reduce((tempResult, currentLayer) => {
      const numberOfNeuronsInNextLayer = currentLayer[0].length;
      const nextLayer = [];

      for (let n = 0; n < numberOfNeuronsInNextLayer; n++) {
        nextLayer.push(0);
      }

      // multiply each input value or temporary hidden layer value with the weight assigned to the link to the next layer
      for (let c = 0; c < currentLayer.length; c++) {
        for (let n = 0; n < numberOfNeuronsInNextLayer; n++) {
          nextLayer[n] += tempResult[c] * currentLayer[c][n];
        }
      }

      // normalise the neuron values of next layer
      for (let n = 0; n < numberOfNeuronsInNextLayer; n++) {
        nextLayer[n] = activationFunction(nextLayer[n], numberOfNeuronsInNextLayer);
      }

      return nextLayer;
    }, inputSignal);
  }

  /*
   * Uses the network to make a prediction of the word that will most likely follow the words passed in precedingWords.
   * Returns an index (zero based) that can then be used to look up the word in uniqueWordArray.
   */
  function makePrediction (network, uniqueWordArray, precedingWords) {
    let outputLayer = calculateOutput(network, uniqueWordArray, precedingWords),
        outputIndex;

    for (let i = 0; i < outputLayer.length; i++) {
      if (i === 0) {
        outputIndex = i;
      }
      else if (outputLayer[i] > outputLayer[i - 1]) {
        outputIndex = i;
      }
    }

    return outputIndex;
  }

  function activationFunction (x, scaleY) {
    // sigmoid function
    return 1 / (1 + Math.pow(Math.E, -(x/scaleY)));
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

  function cutLastWord (wordInput) {
    return wordInput.reduce((output, word, i, wordInput) => {
      if (i < wordInput.length - 1) {
        output.push(word);
      }
      return output;
    }, []);
  };

  return {
    init: init
  };
})();

window.app.init();
