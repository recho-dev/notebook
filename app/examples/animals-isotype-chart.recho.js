/**
 * @title How to Create a Animals Isotype Chart?
 * @created 2025-09-03
 * @author Bairui Su
 * @pull_request 84
 * @github pearmini
 * @thumbnail_start 32
 * @ref https://observablehq.com/@observablehq/plot-isotype-chart
 */

/**
 * ============================================================================
 * =                   How to Create a Animals Isotype Chart?                 =
 * ============================================================================
 *
 * > Ref. https://observablehq.com/@observablehq/plot-isotype-chart
 *
 * Recho is suitable for Isotype Chart (Unit Chart), because it allows you to
 * encode data as characters easily. This sketch shows how to create a animals
 * isotype chart step by step. It's also a good example to show that Recho is
 * powerful in echoing intermediate results, helping you to understand the
 * data and the process of creating the chart.
 *
 * The final chart looks like below, which tells us about the live stock of
 * animals in Great Britain and United States. Compared to Great Britain, the
 * United States has more cattle and pigs, with pig showing the most dramatic
 * difference. In Great Britain, sheep are more prominent, which may related to
 * the country's geography and dietary traditions, such as the wool industry
 * and lamb consumption.
 */

//➜
//➜             Great Britain
//➜     pigs -| 🐖
//➜   cattle -| 🐄 🐄 🐄 🐄
//➜    sheep -| 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑
//➜
//➜             United States
//➜     pigs -| 🐖 🐖 🐖 🐖 🐖 🐖
//➜   cattle -| 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄
//➜    sheep -| 🐑 🐑 🐑 🐑 🐑 🐑 🐑
//➜
//➜ Live stock (millions)
//➜
echo(output);

/**
 * Next, let's dive into how `output` is generated.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                          Preparing the data
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * First, we need to prepare the data. We're going to use the following dataset
 * to create the chart. It's a tiny tubular dataset, with each row representing
 * a animal in a country and the count of the animal.
 */

const data = [
  {animal: "pigs", country: "Great Britain", count: 1354979},
  {animal: "cattle", country: "Great Britain", count: 3962921},
  {animal: "sheep", country: "Great Britain", count: 10931215},
  {animal: "pigs", country: "United States", count: 6281935},
  {animal: "cattle", country: "United States", count: 9917873},
  {animal: "sheep", country: "United States", count: 7084151},
];

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            Importing D3
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Then we import D3 to help us with the data processing. In Recho, you can
 * typically use `recho.require(name)` to import an external library.
 *
 * > Ref. https://recho.dev/docs/libraries-imports
 * > Ref. https://d3js.org/
 */

const d3 = recho.require("d3");

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                          Generating the bars
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * We'll get started with generating the bars. There are three main tasks here:
 *
 * 1. Mapping animals types to their corresponding emojis.
 * 2. Mapping the counts to the number of emojis.
 * 3. Generating the bars based on the emojis and the number.
 *
 * Here is the implementation:
 */

//➜ [ 0, 1, 2, 3, 4, 5 ]
const I = echo(d3.range(data.length));

//➜ { cattle: "🐄", sheep: "🐑", pigs: "🐖" }
const emoji = echo({cattle: "🐄", sheep: "🐑", pigs: "🐖"});

//➜ [ "🐖", "🐄", "🐑", "🐖", "🐄", "🐑" ]
const E = echo(data.map((d) => emoji[d.animal]));

//➜ [ 1, 4, 11, 6, 10, 7 ]
const V = echo(data.map((d) => Math.round(d.count / 1e6)));

//➜ [ "🐖 ", "🐄 🐄 🐄 🐄 ", "🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 ", "🐖 🐖 🐖 🐖 🐖 🐖 ", "🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 ", "🐑 🐑 🐑 🐑 🐑 🐑 🐑 " ]
const bars = echo(I.map((i) => `${E[i]} `.repeat(V[i])));

/** This is the chart we got so far. */

//➜ 🐖
//➜ 🐄 🐄 🐄 🐄
//➜ 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑
//➜ 🐖 🐖 🐖 🐖 🐖 🐖
//➜ 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄
//➜ 🐑 🐑 🐑 🐑 🐑 🐑 🐑
echo(bars.join("\n"));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                          Adding the labels
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Next step is to add the labels to the bars. We need to collect all the
 * animal types by a set, and compute a margin left to make sure the labels
 * are aligned. Then concatenate the labels to the bars with a separator: `-|`.
 */

//➜ [ "pigs", "cattle", "sheep" ]
const L = echo(Array.from(new Set(data.map((d) => d.animal))));

//➜ 6
const marginLeft = echo(d3.max(L, (d) => d.length));

//➜ [ "  pigs", "cattle", " sheep", "  pigs", "cattle", " sheep" ]
const labels = echo(data.map((d) => d.animal.padStart(marginLeft, " ")));

//➜ [ "    pigs -| 🐖 ", "  cattle -| 🐄 🐄 🐄 🐄 ", "   sheep -| 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 ", "    pigs -| 🐖 🐖 🐖 🐖 🐖 🐖 ", "  cattle -| 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 ", "   sheep -| 🐑 🐑 🐑 …
const rows = echo(I.map((i) => "  " + labels[i] + " -| " + bars[i]));

/** Now the chart looks like this. */

//➜     pigs -| 🐖
//➜   cattle -| 🐄 🐄 🐄 🐄
//➜    sheep -| 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑
//➜     pigs -| 🐖 🐖 🐖 🐖 🐖 🐖
//➜   cattle -| 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄
//➜    sheep -| 🐑 🐑 🐑 🐑 🐑 🐑 🐑
echo(rows.join("\n"));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                         Generating the titles
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Technically speaking, the chart is a facet chart, which means it contains
 * multiple charts. The first one is for Great Britain, and the second one is
 * for United States. In order to differentiate the two charts, we need to add
 * the titles and some spacing.
 */

//➜ 45
const width = echo(d3.max(rows, (d) => d.length));

//➜ [ "Great Britain", "United States" ]
const T = echo(Array.from(new Set(data.map((d) => d.country))));

//➜ [ "            Great Britain", "            United States" ]
const titles = echo(T.map((t) => t.padStart(Math.ceil(width / 2 + 2), " ")));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                             Final output
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Finally, we can concatenate the titles, the rows, and the live stock caption
 * to get the final output!
 */

//➜
//➜             Great Britain
//➜     pigs -| 🐖
//➜   cattle -| 🐄 🐄 🐄 🐄
//➜    sheep -| 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑 🐑
//➜
//➜             United States
//➜     pigs -| 🐖 🐖 🐖 🐖 🐖 🐖
//➜   cattle -| 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄 🐄
//➜    sheep -| 🐑 🐑 🐑 🐑 🐑 🐑 🐑
//➜
//➜ Live stock (millions)
//➜
const output = echo(
  [
    " ",
    titles[0], // Great Britain
    ...rows.slice(0, 3),
    " ",
    titles[1], // United States
    ...rows.slice(3),
    " ",
    "Live stock (millions)", // Add a caption
    " ",
  ].join("\n"),
);
