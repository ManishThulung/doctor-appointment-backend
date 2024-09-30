const englishAfinnVoca = require("afinn-165");
import englishNegations from "./constants/negetions.json";

// Mapping from type of vocabulary to language to vocabulary
const languageFiles = {
  afinn: {
    English: [englishAfinnVoca, englishNegations],
  },
};

export default class SentimentAnalyzer {
  // private language: any
  private stemmer: any;
  language: any;
  vocabulary: any;
  negations: any[];

  constructor(language, stemmer, type) {
    this.language = language;
    this.stemmer = stemmer;

    // this.vocabulary must be a copy of the languageFiles object
    // or in subsequent execution the polarity will be undefined
    if (languageFiles[type]) {
      if (languageFiles[type][language]) {
        if (languageFiles[type][language][0]) {
          this.vocabulary = Object.create(languageFiles[type][language][0]);
        }
      } else {
        throw new Error(
          "Type " + type + " for Language " + language + " not supported"
        );
      }
    } else {
      throw new Error("Type Language " + type + " not supported");
    }
    this.vocabulary = Object.assign({}, languageFiles[type][language][0]);
    Object.setPrototypeOf(this.vocabulary, null);

    this.negations = [];
    if (languageFiles[type][language][1] != null) {
      this.negations = languageFiles[type][language][1];
    }

    if (stemmer) {
      const vocaStemmed = Object.create(null);
      for (const token in this.vocabulary) {
        vocaStemmed[stemmer.stem(token)] = this.vocabulary[token];
      }
      this.vocabulary = vocaStemmed;
    }
  }

  // words is an array of words (strings)
  getSentiment(words) {
    let score = 0;
    let negator = 1;
    let nrHits = 0;
    const DEBUG = false;

    words.forEach((token) => {
      const lowerCased = token.toLowerCase();
      // holds words like "not" or "never". If the word is a negation, negator is set to -1 and vice varca
      if (this.negations.indexOf(lowerCased) > -1) {
        negator = -1;
        DEBUG && nrHits++;
      } else {
        //  If the word is found, the vocabulary[lowerCased] contains its sentiment score, which is multiplied by negator and added to the score
        if (this.vocabulary[lowerCased] !== undefined) {
          score += negator * this.vocabulary[lowerCased];
          DEBUG && nrHits++;
        } else {
          if (this.stemmer) {
            // convert running to run
            const stemmedWord = this.stemmer.stem(lowerCased);
            if (this.vocabulary[stemmedWord] !== undefined) {
              score += negator * this.vocabulary[stemmedWord];
              DEBUG && nrHits++;
            }
          }
        }
      }
    });

    score = score / words.length;
    DEBUG && console.log("Number of hits: " + nrHits);

    return score;
  }
}
