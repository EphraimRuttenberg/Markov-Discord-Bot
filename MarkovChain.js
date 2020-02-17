function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function selectChunk (chunks) {
    //This function selects a chunk randomly using word frequencies as odds for each chunk
    const startTime = Date.now();
    const total = Object.values(chunks).reduce((a, b) => a + b, 0); //Find the total of all the word frequencies
    //Each new value represents its proportion of the sum total, giving it a percentage chance from 0 to 1 of being selected
    Object.keys(chunks).forEach(function (key) {
        chunks[key] /= total;
    })
    var number = Math.random();
    var index = 0;
    const keys = shuffle(Object.keys(chunks));
    //Subtract the chances of each word from a random number, return the word if the number hits 0
    while (true) {
        if (Date.now() - startTime > 5000) {
            return null;
        }
        number -= chunks[keys[index]];
        if (number <= 0) {
            return keys[index];
        }

        index += 1;
    }
}


const stopChar = "\a";

module.exports = {
chunkText: function (inputText, wordPatterns, wordFrequencies, firstWords) {
    /*This function takes input text, data about each state, and the frequencies of every word
    * wordPatterns has information about each state and looks like:
    * {word A: {word B: # of times B comes after A, word C: # of times C comes after A},
    * word D: {...}}
    * wordFrequencies is an object with words as keys and frequencies as values
    * Each word has value
    */


    inputText += stopChar;
    var text = inputText.split(" ");
    var currentChunk;
    var nextChunk;

    var firstWord = text[0];
    if (firstWord in firstWords) {
        firstWords[firstWord] += 1;
    } else {
        firstWords[firstWord] = 1;
    }

    for(i = 0; i  < text.length - 1; i++){
        currentChunk = text[i];
        nextChunk = text[i+1];
        //If the current chunk is already in the dict, increment all of its values
        //Values include: word frequency and data about the next chunk's frequency
        if (currentChunk in wordPatterns) {
            wordFrequencies[currentChunk] += 1;
            //If the current chunk already has data on the next chunk, increment its values
            if (nextChunk in wordPatterns[currentChunk]) {
                wordPatterns[currentChunk][nextChunk] += 1;
            } else {
                wordPatterns[currentChunk][nextChunk] = 1;
            }
        //Otherwise, add currentChunk to the dict and set its values to 1
        } else {
            wordFrequencies[currentChunk] = 1;
            wordPatterns[currentChunk] = {};
            wordPatterns[currentChunk][nextChunk] = 1;
        }

    }
    return [wordPatterns, wordFrequencies, firstWords];
},

    makeChain: function (wordPatterns, chunks, firstWords, minChainLength, maxChainLength) {
    /*This function creates a markov chain based on a list of all chunks and a dict
    * with data about the chunks and frequencies of words following those chunks
    */
    var chain = "";
    const startTime = Date.now();
    var currentChunk = selectChunk(firstWords);

    chain += currentChunk;
    count = 1;
    while (1) {
        if (Date.now() - startTime >= 50000) {
            return chain;
        }
        if (wordPatterns == {}) {
            console.log("patterns empty");
            return "No chain could be made at this time";
        }
        if (chunks == {}) {
            console.log("patterns empty");
            return "No chain could be made at this time";
        }
        if (firstWords == {}) {
            console.log("patterns empty");
            return "No chain could be made at this time";
        }
        var removal = [];
        if (count > maxChainLength && maxChainLength > 0) {
            break;
        }

        if (currentChunk in wordPatterns) {
            currentChunk = selectChunk(wordPatterns[currentChunk]);
        } else {
            currentChunk = selectChunk(firstWords);
        }

        if(currentChunk == null){
            console.log("chunk null");
            console.log(wordPatterns);
            console.log(currentChunk);
            return "No chain could be made at this time";
        };
        chain += " " + currentChunk;
        if (currentChunk.includes(stopChar) && count >= minChainLength) {
            break;
        }
        count++;
        }
        return chain;
    }
}
