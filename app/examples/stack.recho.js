/**
 * @title Stack
 * @author Bairui Su
 * @github pearmini
 * @created 2025-12-09
 * @label Algorithm
 * @thumbnail_start 20
 * @pull_request 201
 */

/**
 * ============================================================================
 * =                                Stack                                     =
 * ============================================================================
 *
 * This example demonstrates a classic Stack data structure with push and pop
 * operations. A stack follows the LIFO (Last In, First Out) principle. The
 * following is a simple demonstration of how it looks like.
 */

const [stack, setStack] = recho.state(new Stack());

//➜ "gol\\hRXCro^^suA"
echo(stack.items.join(""));

// Push button - adds a random alphabet character to the stack
recho.button("Push", push);

// Pop button - removes the top element from the stack
recho.button("Pop", pop);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                               Implementation
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * The stack is implemented as a class with a few methods:
 *
 * - `push(element)`: adds an element to the stack
 * - `pop()`: removes the top element from the stack
 * - `clone()`: creates a deep copy of the stack
 *
 */

class Stack {
  constructor() {
    this.items = [];
  }

  push(element) {
    this.items.push(element);
  }

  pop() {
    if (this.items.length === 0) return undefined;
    return this.items.pop();
  }

  clone() {
    const cloned = new Stack();
    cloned.items = [...this.items];
    return cloned;
  }
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                               Helper Functions
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * The following are helper functions to push and pop elements from the stack,
 * and a function to generate a random alphabet character (A-z).
 */

function push() {
  setStack((s) => {
    const cloned = s.clone();
    cloned.push(randomAlphabet());
    return cloned;
  });
}

function pop() {
  setStack((s) => {
    const cloned = s.clone();
    cloned.pop();
    return cloned;
  });
}

// Function to generate a random alphabet character (A-z)
function randomAlphabet() {
  // Generate random character from A (65) to z (122)
  // This includes A-Z (65-90), some special chars (91-96), and a-z (97-122)
  const code = Math.floor(Math.random() * (122 - 65 + 1)) + 65;
  return String.fromCharCode(code);
}
