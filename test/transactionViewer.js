import {ViewPlugin} from "@codemirror/view";
import {Transaction} from "@codemirror/state";
import {blockMetadataEffect} from "../editor/blockMetadata.ts";

// Maximum number of transactions to keep in history
const MAX_HISTORY = 100;

/**
 * Creates a transaction tracker plugin and UI viewer
 */
export function createTransactionViewer(container) {
  const transactions = [];
  const listeners = new Set();
  let nextIndex = 0; // Continuous index counter

  // Notify all listeners when transactions update
  function notifyListeners() {
    listeners.forEach((fn) => fn(transactions));
  }

  // Create the ViewPlugin to track transactions
  const plugin = ViewPlugin.fromClass(
    class {
      constructor(view) {
        // Capture initial state as transaction 0
        const initialTr = {
          index: nextIndex++,
          docChanged: false,
          changes: [],
          annotations: {},
          effects: [],
          selection: view.state.selection.ranges.map((r) => ({
            from: r.from,
            to: r.to,
            anchor: r.anchor,
            head: r.head,
          })),
          timestamp: Date.now(),
        };
        transactions.push(initialTr);
        notifyListeners();
      }

      update(update) {
        // Process each transaction in the update
        update.transactions.forEach((tr, idx) => {
          const transactionData = extractTransactionData(tr, nextIndex++);

          // Add to history
          transactions.push(transactionData);

          // Keep only the last MAX_HISTORY transactions
          if (transactions.length > MAX_HISTORY) {
            transactions.shift();
          }
        });

        if (update.transactions.length > 0) {
          notifyListeners();
        }
      }
    },
  );

  // Extract data from a transaction
  function extractTransactionData(tr, index) {
    const data = {
      index,
      docChanged: tr.docChanged,
      changes: [],
      annotations: {},
      effects: [],
      selection: tr.state.selection.ranges.map((r) => ({
        from: r.from,
        to: r.to,
        anchor: r.anchor,
        head: r.head,
      })),
      scrollIntoView: tr.scrollIntoView,
      filter: tr.filter,
      sequential: tr.sequential,
      timestamp: Date.now(),
    };

    // Extract changes with line/column information
    // Use startState for from/to positions (before the change)
    tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
      const fromLine = tr.startState.doc.lineAt(fromA);
      const toLine = tr.startState.doc.lineAt(toA);

      data.changes.push({
        from: fromA,
        to: toA,
        fromLine: fromLine.number,
        fromCol: fromA - fromLine.from,
        toLine: toLine.number,
        toCol: toA - toLine.from,
        insert: inserted.toString(),
      });
    });

    // Extract annotations
    const userEvent = tr.annotation(Transaction.userEvent);
    if (userEvent !== undefined) {
      data.annotations.userEvent = userEvent;
    }

    const remote = tr.annotation(Transaction.remote);
    if (remote !== undefined) {
      data.annotations.remote = remote;
    }

    // Check for other common annotations
    const addToHistory = tr.annotation(Transaction.addToHistory);
    if (addToHistory !== undefined) {
      data.annotations.addToHistory = addToHistory;
    }

    // Extract effects
    for (const effect of tr.effects) {
      const effectData = {
        value: effect.value,
        type: "StateEffect",
      };

      // Check if this is a blockMetadataEffect
      if (effect.is(blockMetadataEffect)) {
        effectData.type = "blockMetadataEffect";
        effectData.blockMetadata = effect.value;
      }

      data.effects.push(effectData);
    }

    return data;
  }

  // Create the UI
  const viewerElement = document.createElement("div");
  viewerElement.className = "transaction-viewer";
  viewerElement.innerHTML = `
    <h3>Transactions</h3>
    <div class="transaction-controls">
      <button id="clear-transactions">Clear</button>
      <label>
        <input type="checkbox" id="auto-scroll" checked>
        Auto-scroll
      </label>
    </div>
    <div class="transaction-list-scrollable">
      <div class="transaction-list"></div>
    </div>
  `;

  const listElement = viewerElement.querySelector(".transaction-list");
  const clearButton = viewerElement.querySelector("#clear-transactions");
  const autoScrollCheckbox = viewerElement.querySelector("#auto-scroll");

  clearButton.onclick = () => {
    transactions.length = 0;
    nextIndex = 0; // Reset the index counter
    renderTransactions();
  };

  function renderTransactions() {
    listElement.innerHTML = "";

    if (transactions.length === 0) {
      listElement.innerHTML = '<div class="no-transactions">No transactions yet</div>';
      return;
    }

    // Group transactions - group consecutive selection transactions
    const groups = [];
    let currentGroup = null;

    // Process in reverse order (newest first)
    for (let i = transactions.length - 1; i >= 0; i--) {
      const tr = transactions[i];
      const isSelection = tr.annotations.userEvent === "select" || tr.annotations.userEvent === "select.pointer";

      if (isSelection) {
        if (currentGroup && currentGroup.type === "selection") {
          // Add to existing selection group
          currentGroup.transactions.push(tr);
        } else {
          // Start a new selection group
          currentGroup = {
            type: "selection",
            transactions: [tr],
          };
          groups.push(currentGroup);
        }
      } else {
        // Non-selection transaction - add as individual
        groups.push({
          type: "individual",
          transaction: tr,
        });
        currentGroup = null;
      }
    }

    // Render groups
    for (const group of groups) {
      if (group.type === "individual") {
        const item = createTransactionItem(group.transaction);
        listElement.appendChild(item);
      } else {
        const groupItem = createSelectionGroupItem(group.transactions);
        listElement.appendChild(groupItem);
      }
    }

    // Auto-scroll to top (latest transaction)
    if (autoScrollCheckbox.checked) {
      listElement.scrollTop = 0;
    }
  }

  /**
   *
   * @param {import("@codemirror/state").TransactionSpec} tr
   * @returns
   */
  function createSelectionGroupItem(transactions) {
    const item = document.createElement("details");
    item.className = "transaction-item transaction-group";

    const count = transactions.length;
    const firstTr = transactions[0];
    const lastTr = transactions[transactions.length - 1];

    // Format timestamps
    const firstTime = new Date(firstTr.timestamp);
    const lastTime = new Date(lastTr.timestamp);
    const firstTimeStr =
      firstTime.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) +
      "." +
      firstTime.getMilliseconds().toString().padStart(3, "0");
    const lastTimeStr =
      lastTime.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) +
      "." +
      lastTime.getMilliseconds().toString().padStart(3, "0");

    const summaryLeft = `#${lastTr.index}-${firstTr.index} [select] (${count} transactions)`;
    const summaryRight = `${lastTimeStr} - ${firstTimeStr}`;

    // Create list of individual transactions
    const transactionsList = transactions
      .map((tr) => {
        const time = new Date(tr.timestamp);
        const timeStr =
          time.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) +
          "." +
          time.getMilliseconds().toString().padStart(3, "0");

        const selectionInfo = tr.selection
          .map((range, idx) => {
            const isCursor = range.from === range.to;
            return isCursor ? `cursor at ${range.from}` : `${range.from}-${range.to}`;
          })
          .join(", ");

        return `
          <div class="tr-grouped-item">
            <span class="tr-grouped-index">#${tr.index}</span>
            <span class="tr-grouped-selection">${selectionInfo}</span>
            <span class="tr-grouped-time">${timeStr}</span>
          </div>
        `;
      })
      .join("");

    item.innerHTML = `
      <summary>
        <span class="tr-summary-left">${summaryLeft}</span>
        <span class="tr-summary-right">${summaryRight}</span>
      </summary>
      <div class="tr-details">
        <div class="tr-grouped-list">
          ${transactionsList}
        </div>
      </div>
    `;

    return item;
  }

  function createTransactionItem(tr) {
    const item = document.createElement("details");
    item.className = "transaction-item";

    // Add classes based on transaction type
    if (tr.annotations.userEvent) {
      item.classList.add("user-transaction");
    }
    if (tr.annotations.remote) {
      item.classList.add("remote-transaction");
    }
    if (tr.docChanged) {
      item.classList.add("doc-changed");
    }

    // Format timestamp as HH:MM:SS.mmm
    const time = new Date(tr.timestamp);
    const timeStr =
      time.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) +
      "." +
      time.getMilliseconds().toString().padStart(3, "0");

    let summaryLeft = `#${tr.index}`;
    if (tr.annotations.userEvent) {
      summaryLeft += ` [${tr.annotations.userEvent}]`;
    } else if (tr.annotations.remote) {
      summaryLeft += ` [remote: ${JSON.stringify(tr.annotations.remote)}]`;
    }
    if (tr.docChanged) {
      summaryLeft += ` 📝`;
    }

    const details = [];

    // Document changed
    details.push(`<div class="tr-field"><strong>Doc Changed:</strong> ${tr.docChanged}</div>`);

    // Changes
    if (tr.changes.length > 0) {
      details.push(`<div class="tr-field"><strong>Changes:</strong></div>`);
      tr.changes.forEach((change, idx) => {
        const deleted = change.to - change.from;
        const inserted = change.insert.length;
        const samePos = change.from === change.to;
        const sameLine = change.fromLine === change.toLine;

        let posInfo = `pos ${change.from}-${change.to}`;
        if (sameLine) {
          posInfo += ` (L${change.fromLine}:${change.fromCol}-${change.toCol})`;
        } else {
          posInfo += ` (L${change.fromLine}:${change.fromCol} to L${change.toLine}:${change.toCol})`;
        }

        details.push(`
          <div class="tr-change">
            <div>Change ${idx + 1}: ${posInfo}</div>
            ${deleted > 0 ? `<div class="deleted">Deleted ${deleted} chars</div>` : ""}
            ${inserted > 0 ? `<div class="inserted">Inserted: <code>${escapeHtml(change.insert)}</code></div>` : ""}
          </div>
        `);
      });
    } else {
      details.push(`<div class="tr-field"><strong>Changes:</strong> none</div>`);
    }

    // Annotations
    if (Object.keys(tr.annotations).length > 0) {
      details.push(`<div class="tr-field"><strong>Annotations:</strong></div>`);
      for (const [key, value] of Object.entries(tr.annotations)) {
        details.push(`<div class="tr-annotation">${key}: ${JSON.stringify(value)}</div>`);
      }
    } else {
      details.push(`<div class="tr-field"><strong>Annotations:</strong> none</div>`);
    }

    // Effects
    if (Array.isArray(tr.effects) && tr.effects.length > 0) {
      details.push(`<div class="tr-field"><strong>Effects:</strong> ${tr.effects.length}</div>`);
      tr.effects.forEach((effect, idx) => {
        if (effect.type === "blockMetadataEffect" && effect.blockMetadata) {
          // Special handling for blockMetadataEffect
          details.push(`
            <div class="tr-effect tr-effect-block-metadata">
              <div class="tr-effect-title">Effect ${idx + 1}: blockMetadataEffect (${effect.blockMetadata.length} blocks)</div>
              ${effect.blockMetadata
                .map(
                  (block, blockIdx) => `
                <div class="tr-block-metadata">
                  <div class="tr-block-header">Block ${blockIdx + 1}:</div>
                  <div class="tr-block-detail">
                    ${block.output !== null ? `Output: ${block.output.from}-${block.output.to}` : "Output: null"}
                  </div>
                  <div class="tr-block-detail">
                    Source: ${block.source.from}-${block.source.to}
                  </div>
                  ${
                    Object.keys(block.attributes).length > 0
                      ? `<div class="tr-block-detail">Attributes: ${JSON.stringify(block.attributes)}</div>`
                      : ""
                  }
                  ${block.error ? '<div class="tr-block-detail tr-block-error">Error: true</div>' : ""}
                </div>
              `,
                )
                .join("")}
            </div>
          `);
        } else {
          // Generic effect display
          details.push(`
            <div class="tr-effect">
              Effect ${idx + 1} (${effect.type}): ${JSON.stringify(effect.value).substring(0, 100)}
            </div>
          `);
        }
      });
    } else {
      details.push(`<div class="tr-field"><strong>Effects:</strong> none</div>`);
    }

    // Selection
    details.push(`<div class="tr-field"><strong>Selection:</strong></div>`);
    tr.selection.forEach((range, idx) => {
      const isCursor = range.from === range.to;
      details.push(`
        <div class="tr-selection">
          Range ${idx + 1}: ${isCursor ? `cursor at ${range.from}` : `${range.from}-${range.to}`}
          ${!isCursor ? `(anchor: ${range.anchor}, head: ${range.head})` : ""}
        </div>
      `);
    });

    // Additional transaction properties
    const additionalProps = [];
    if (tr.scrollIntoView !== undefined) {
      additionalProps.push(`scrollIntoView: ${tr.scrollIntoView}`);
    }
    if (tr.filter !== undefined) {
      additionalProps.push(`filter: ${tr.filter}`);
    }
    if (tr.sequential !== undefined) {
      additionalProps.push(`sequential: ${tr.sequential}`);
    }

    if (additionalProps.length > 0) {
      details.push(`<div class="tr-field"><strong>Other Properties:</strong></div>`);
      additionalProps.forEach((prop) => {
        details.push(`<div class="tr-property">${prop}</div>`);
      });
    }

    item.innerHTML = `
      <summary>
        <span class="tr-summary-left">${summaryLeft}</span>
        <span class="tr-summary-right">${timeStr}</span>
      </summary>
      <div class="tr-details">
        ${details.join("")}
      </div>
    `;

    return item;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Listen for transaction updates
  listeners.add(renderTransactions);

  // Initial render
  renderTransactions();

  // Append to container
  container.appendChild(viewerElement);

  return {
    plugin,
    destroy: () => {
      listeners.clear();
      viewerElement.remove();
    },
  };
}
