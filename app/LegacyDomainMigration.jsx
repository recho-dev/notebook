"use client";

import {useEffect} from "react";
import {getRawNotebooksPayload, importLegacyNotebooks} from "./api.js";

// recho.dev used to proxy to this app while keeping the browser on the
// recho.dev origin, so notebooks saved back then live in that origin's
// localStorage. Now that recho.dev serves this app directly instead of
// canonicalizing through www.recho.dev at the edge, this component carries
// those notebooks across the origin boundary by hand: on the legacy host it
// reads local notebooks and forwards them via a URL fragment (never sent to
// any server) while redirecting to the canonical host, which imports them on
// arrival. Remove once recho.dev traffic carrying pre-migration data has
// faded out.

const LEGACY_HOST = "recho.dev";
const CANONICAL_HOST = "www.recho.dev";
const MIGRATE_PARAM = "migrate";
// Keep well under practical URL length limits; a best-effort migration, not
// a guarantee for accounts with an unusually large amount of saved content.
const MAX_PAYLOAD_LENGTH = 20000;

export function LegacyDomainMigration() {
  useEffect(() => {
    const {hostname, hash, pathname, search} = window.location;

    if (hostname === LEGACY_HOST) {
      let fragment = "";
      try {
        const payload = getRawNotebooksPayload();
        if (payload && payload.length <= MAX_PAYLOAD_LENGTH) {
          fragment = `#${MIGRATE_PARAM}=${encodeURIComponent(payload)}`;
        }
      } catch {
        // localStorage inaccessible (e.g. private browsing) — redirect without it.
      }
      window.location.replace(`https://${CANONICAL_HOST}${pathname}${search}${fragment}`);
      return;
    }

    if (hostname === CANONICAL_HOST && hash.startsWith(`#${MIGRATE_PARAM}=`)) {
      try {
        importLegacyNotebooks(decodeURIComponent(hash.slice(MIGRATE_PARAM.length + 2)));
      } catch {
        // Malformed or corrupted payload — nothing to recover, ignore it.
      } finally {
        window.history.replaceState(null, "", pathname + search);
      }
    }
  }, []);

  return null;
}
