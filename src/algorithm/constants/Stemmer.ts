// Porter Stemming Algorithm

// The functions categorizeGroups() and categorizeChars() classify groups or individual characters of a word into consonants (C) and vowels (V).
function categorizeGroups(token) {
  return token
    .replace(/[^aeiouy]+y/g, "CV")
    .replace(/[aeiou]+/g, "V")
    .replace(/[^V]+/g, "C");
}
function categorizeChars(token) {
  return token
    .replace(/[^aeiouy]y/g, "CV")
    .replace(/[aeiou]/g, "V")
    .replace(/[^V]/g, "C");
}

// The function first removes an initial consonant and a trailing vowel (if any), then counts how many VC pairs are left.
function measure(token) {
  if (!token) {
    return -1;
  }

  return categorizeGroups(token).replace(/^C/, "").replace(/V$/, "").length / 2;
}

// determine if a token end with a double consonant then reduced to a single consonant in the stemming process.
function endsWithDoublCons(token) {
  return token.match(/([^aeiou])\1$/);
}

// replace a pattern in a word. if a replacement occurs an optional callback
// can be called to post-process the result. if no match is made NULL is
// returned.
function attemptReplace(token, pattern, replacement, callback) {
  let result = null;

  if (
    typeof pattern === "string" &&
    token.substr(0 - pattern.length) === pattern
  ) {
    result = token.replace(new RegExp(pattern + "$"), replacement);
  } else if (pattern instanceof RegExp && token.match(pattern)) {
    result = token.replace(pattern, replacement);
  }

  if (result && callback) {
    return callback(result);
  } else {
    return result;
  }
}

// attempt to replace a list of patterns/replacements on a token for a minimum
// measure M.
function attemptReplacePatterns(token, replacements, measureThreshold) {
  let replacement = token;
  let callback = token;

  for (let i = 0; i < replacements.length; i++) {
    if (
      measureThreshold == null ||
      measure(
        attemptReplace(token, replacements[i][0], callback, replacements[i][1])
      ) > measureThreshold
    ) {
      replacement =
        attemptReplace(
          replacement,
          replacements[i][0],
          replacements[i][2],
          callback
        ) || replacement;
    }
  }

  return replacement;
}

// replace a list of patterns/replacements on a word. if no match is made return
// the original token.
function replacePatterns(token, replacements, measureThreshold) {
  return attemptReplacePatterns(token, replacements, measureThreshold) || token;
}

// TODO: this should replace all of the messy replacement stuff above
function replaceRegex(token, regex, includeParts, minimumMeasure) {
  let parts;
  let result = "";

  if (regex.test(token)) {
    parts = regex.exec(token);

    includeParts.forEach(function (i) {
      result += parts[i];
    });
  }

  if (measure(result) > minimumMeasure) {
    return result;
  }

  return null;
}

// eats -> eat
function step1a(token) {
  if (token.match(/(ss|i)es$/)) {
    return token.replace(/(ss|i)es$/, "$1");
  }

  if (
    token.substr(-1) === "s" &&
    token.substr(-2, 1) !== "s" &&
    token.length > 2
  ) {
    return token.replace(/s?$/, "");
  }

  return token;
}

// danced -> dance
function step1b(token) {
  let result;
  if (token.substr(-3) === "eed") {
    if (measure(token.substr(0, token.length - 3)) > 0) {
      return token.replace(/eed$/, "ee");
    }
  } else {
    result = attemptReplace(token, /(ed|ing)$/, "", function (token) {
      if (categorizeGroups(token).indexOf("V") >= 0) {
        result = attemptReplacePatterns(
          token,
          [
            ["at", "", "ate"],
            ["bl", "", "ble"],
            ["iz", "", "ize"],
          ],
          result
        );

        if (result !== token) {
          return result;
        } else {
          if (endsWithDoublCons(token) && token.match(/[^lsz]$/)) {
            return token.replace(/([^aeiou])\1$/, "$1");
          }

          if (
            measure(token) === 1 &&
            categorizeChars(token).substr(-3) === "CVC" &&
            token.match(/[^wxy]$/)
          ) {
            return token + "e";
          }
        }

        return token;
      }

      return null;
    });

    if (result) {
      return result;
    }
  }

  return token;
}

// happy -> happi
function step1c(token) {
  const categorizedGroups = categorizeGroups(token);

  if (
    token.substr(-1) === "y" &&
    categorizedGroups.substr(0, categorizedGroups.length - 1).indexOf("V") > -1
  ) {
    return token.replace(/y$/, "i");
  }

  return token;
}

// step 2 as defined for the porter stemmer algorithm.
function step2(token) {
  token = replacePatterns(
    token,
    [
      ["ational", "", "ate"],
      ["tional", "", "tion"],
      ["enci", "", "ence"],
      ["anci", "", "ance"],
      ["izer", "", "ize"],
      ["abli", "", "able"],
      ["bli", "", "ble"],
      ["alli", "", "al"],
      ["entli", "", "ent"],
      ["eli", "", "e"],
      ["ousli", "", "ous"],
      ["ization", "", "ize"],
      ["ation", "", "ate"],
      ["ator", "", "ate"],
      ["alism", "", "al"],
      ["iveness", "", "ive"],
      ["fulness", "", "ful"],
      ["ousness", "", "ous"],
      ["aliti", "", "al"],
      ["iviti", "", "ive"],
      ["biliti", "", "ble"],
      ["logi", "", "log"],
    ],
    0
  );

  return token;
}

// step 3 as defined for the porter stemmer algorithm.
function step3(token) {
  return replacePatterns(
    token,
    [
      ["icate", "", "ic"],
      ["ative", "", ""],
      ["alize", "", "al"],
      ["iciti", "", "ic"],
      ["ical", "", "ic"],
      ["ful", "", ""],
      ["ness", "", ""],
    ],
    0
  );
}

// step 4 as defined for the porter stemmer algorithm. adjustable -> adjust
function step4(token) {
  return (
    replaceRegex(
      token,
      /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,
      [1],
      1
    ) ||
    replaceRegex(token, /^(.+?)(s|t)(ion)$/, [1, 2], 1) ||
    token
  );
}

// step 5a as defined for the porter stemmer algorithm. -> rate -> rat
function step5a(token) {
  const m = measure(token.replace(/e$/, ""));

  if (
    m > 1 ||
    (m === 1 &&
      !(
        categorizeChars(token).substr(-4, 3) === "CVC" &&
        token.match(/[^wxy].$/)
      ))
  ) {
    token = token.replace(/e$/, "");
  }

  return token;
}

// step 5b as defined for the porter stemmer algorithm. fall->fal
function step5b(token) {
  if (measure(token) > 1) {
    return token.replace(/ll$/, "l");
  }

  return token;
}

// perform full stemming algorithm on a single word
export function stem(token) {
  if (token.length < 3) return token.toString();
  return step5b(
    step5a(step4(step3(step2(step1c(step1b(step1a(token.toLowerCase())))))))
  ).toString();
}
