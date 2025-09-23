/**
 * @title Hello Compromise
 * @author Bairui Su
 * @created 2025-09-23
 * @pull_request 120
 * @github pearmini
 * @thumbnail_start 28
 */

/**
 * ============================================================================
 * =                          Hello Compromise                                =
 * ============================================================================
 *
 * This example explores how to use the `compromise` library to process natural
 * language. The content is adapted from the official documentation:
 *
 * https://github.com/spencermountain/compromise
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                             Getting Started
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * First, we import the `compromise` library and change a verb to its past
 * tense for a sentence.
 */

const nlp = await recho.require("compromise");

//➜ View { ptrs: undefined }
const doc = echo(nlp("she sells seashells by the seashore."));

//➜ View { ptrs: [ [ 0, 1, 2, "sold|0JG000003", "sold|0JG000003" ] ] }
echo(doc.verbs().toPastTense());

//➜ "she sells seashells by the seashore."
echo(doc.text());

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                       Finding and Matching Patterns
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Next, we can find and match patterns in the sentence. Similar to regex, but
 * we match with meaning instead of symbols.
 */

//➜ true
echo(doc.has("she #Verb"));

//➜ "she sells seashells by the seashore."
echo(doc.match("she #Verb seashells by the seashore").text());

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            Getting Data
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * We can extend the library with plugins. Then we can get the data from the
 * sentence.
 */

const plg = await recho.require("compromise-speech");

nlp.extend(plg);

const doc2 = nlp("Milwaukee has certainly had its share of visitors..");
doc2.compute("syllables");

//➜ [
//➜   {
//➜     text: "Milwaukee",
//➜     terms: [
//➜       {
//➜         text: "Milwaukee",
//➜         pre: "",
//➜         post: " ",
//➜         tags: [ "Noun", "Singular", "Place", "ProperNoun", "City" ],
//➜         normal: "milwaukee",
//➜         index: [ 0, 0 ],
//➜         id: "milwaukee|0IE00000J",
//➜         chunk: "Noun",
//➜         dirty: true,
//➜         syllables: [ "mil", "waukee" ]
//➜       }
//➜     ]
//➜   }
//➜ ]
echo(doc2.places().json(), {indent: 2, limit: Infinity});

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                         Avoiding Brittle Parsers
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * We can avoid the problems of brittle parsers:
 */

const doc3 = nlp("we're not gonna take it..");

//➜ true
echo(doc3.has("gonna"));

//➜ true
echo(doc3.has("going to"));

//➜ Contractions { ptrs: [] }
echo(doc.contractions().expand());

//➜ "she sells seashells by the seashore."
echo(doc.text());

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            Whipping Stuff Around
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * We can whip stuff around like it's data:
 */

//➜ "ninety five thousand and seventy two"
{
  const doc = nlp("ninety five thousand and fifty two");
  doc.numbers().add(20);
  echo(doc.text());
}

/**
 * because it's actually is:
 */

//➜ "the purple dinosaurs"
{
  const doc = nlp("the purple dinosaur");
  doc.nouns().toPlural();
  echo(doc.text());
}
