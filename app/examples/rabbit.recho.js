/**
 * @title Rabbit
 * @author Bairui Su
 * @created 2026-01-04
 * @pull_request 195
 * @github pearmini
 * @label ASCII Art, Beginner
 * @thumbnail_start 21
 */

/**
 * ============================================================================
 * =                           Rabbit                                        =
 * ============================================================================
 *
 * Create a simple animation of rabbit inspired by the OpenAI DevDay 2025
 *
 * - Ref. https://openai.com/devday/
 */

//➜   (\_/)
//➜   (^.^)
//➜   ╰ < ╯
//➜   /(")(")
{
  const c = echo.set("compact", true);
  const n = R.length;
  const str = R[t % n];
  if (str) c(x(str));
}

const t = recho.interval(200);

const x = (d) => recho.inspect(d, {quote: false});

// prettier-ignore
const R = [
`  (\\_/)  
  (O.O)  
| ╰ ' ╯  
v /(")(") `,
null,
null,
`  |)|)  
  (O )  
| ╰' ╯  
v /(")(") `,
`  |)|)  
  (O )  
| ╰' ╯  
v o(")(") `,
`  |)|)  
| (O )  
o ╰' ╯  
v  (")(") `,
`  |)|)  
  (O )  
-o>  ╯  
   (")(") `,
`  |)|)  
  (O )  
 -o> ╯  
   (")(") `,
`  |)|)  
  (O )  
  -o>╯  
   (")(") `,
`  (\\_/)  
  (^.^)  
   -> ╯
  /(")(") `,
`  (\\_/)  
  (^.^)  
  ╰ -> 
  /(")(") `,
`  (\\_/)  
  (^.^)  
  ╰ ⟨->
  /(")(") `,
  null,
  null,
  null,
  null,
  null,
`  (\\_/)  
  (^.^)  
  ╰ < ╯
  /(")(") `,
  null,
  null,
  null,
`  (\\_/)  
  (O.O)  
  ╰ ' ╯
  /(")(") `,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];
