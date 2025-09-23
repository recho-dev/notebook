/**
 * @title Corpora Art Isms
 * @author Bairui Su
 * @created 2025-09-23
 * @pull_request 118
 * @github pearmini
 * @thumbnail_start 24
 */

/**
 * ============================================================================
 * =                          Corpora Art Isms                                =
 * ============================================================================
 *
 * This is a tiny demo that shows how to fetch data from a remote JSON file and
 * how to use `recho.interval` to create animations in Recho.
 *
 * First, we fetch the data from the Corpora repository. Then we call `echo` to
 * inspect the data. After understanding the shape of the data, we can create a
 * carousel effect to show the isms one by one, which is implemented by using
 * `recho.interval`.
 */

const repose = await fetch("https://raw.githubusercontent.com/dariusk/corpora/refs/heads/master/data/art/isms.json");

//➜ {
//➜   description: "A list of modernist art isms.",
//➜   isms: [ "abstract expressionism", "academic", "action painting", "aestheticism", "art deco", "art nouveau", "avant-garde", "barbizon school", "baroque", "bauhaus", "biedermeier", "caravaggisti", "carolingian", "classicism", "cloisonnism", "cobra", "color field painting", "conceptual art", "cubism", "cubo-futurism", "dada", "dadaism", "de stijl", "deformalism", "der blaue reiter", "die brücke", "divisionism", "eclecticism", "ego-futurism", "existentialism", "expressionism", "fauvism", "fluxus", "formalism", "futurism", "geometric abstraction", "gothic art", "gründerzeit", "hard-edge painting", "historicism", "hudson river school", "humanism", "hyperrealism", "idealism", "illusionism", "immagine&poesia", "impressionism", "incoherents", "installation art", "international gothic", "intervention art", "jugendstil", "kinetic art", "land art", "les nabis", "lettrism", "lowbrow", "luminism", "lyrical abstraction", "mail art", "manierism", "mannerism", "maximalism", "merovingian", "metaphysical art ", "minimalism", "modern art", "modernism", "monumentalism", "multiculturalism", "naturalism", "neo-classicism", "neo-dada", "neo-expressionism", "neo-fauvism", "neo-geo", "neo-impressionism", "neo-minimalism", "neoclassicism", "neoism", "neue slowenische kunst", "new media art", "new objectivity", "nonconformism", "nouveau realisme", "op art", "orphism", "ottonian", "outsider art", "performance art", "perspectivism", "photorealism", "pointilism", "pop art", "post-conceptualism", "post-impressionism", "post-minimalism", "post-painterly abstraction", "post-structuralism", "postminimalism", "postmodern art", "postmodernism", "pre-raphaelites", "precisionism", "primitivism", "purism", "rayonism", "realism", "relational art", "remodernism", "renaissance", "rococo", "romanesque", "romanticism", "russian futurism", "russian symbolism", "scuola romana", "secularism", "situationist international", "social realism", "socialist realism", "sound art", "street art", "structuralism", "stuckism international", "stuckism", "superflat", "superstroke", "suprematism", "surrealism", "symbolism", "synchromism", "synthetism", "systems art", "tachism", "tachisme", "tonalism", "video art", "video game art", "vorticism", "young british artists" ]
//➜ }
const data = echo(await repose.json(), {indent: 2, limit: Infinity});

//➜ "academic"
echo(data.isms[frame % data.isms.length]);

const frame = recho.interval(1000);
