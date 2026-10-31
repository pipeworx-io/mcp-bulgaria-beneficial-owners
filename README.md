# @pipeworx/bulgaria-beneficial-owners

A Bulgarian legal entity's beneficial owners (действителни собственици),
from the Registry Agency's (Agentsia po vpisvaniyata) Commercial Register
and Register of Non-Profit Legal Entities. Fleet #3332, Bruce's build-names
ruling on #3329.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1863+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Tools

- `bg_beneficial_owners(eik)` — a Bulgarian legal entity's beneficial owners
  by its EIK/UIC (the 9-digit unified identification code; 13 digits for a
  foreign-company branch). Returns each owner's name, the country the
  register names for them, country of residence when the register states
  one, and the register's OWN free-text description of their manner of
  control. Some entries are the AMLD fallback category — a senior managing
  official recorded when no other beneficial owner can be established —
  rather than a true economic owner, and `manner_of_control` says which, in
  the register's own words. An entity whose record carries no
  natural-person owner on file (common when the ownership chain resolves
  only through other companies) answers `found: true` with an empty owner
  list and `register_note` explaining why, never a silent empty array with
  no context.

Read live, per request — the Registry Agency publishes no bulk open-data
extract of this field, so `data_as_of` is the day of the call, not a mirror
refresh date.

## Auth

Keyless. No account, login or payment is needed to read this field — the
register's own public search tool serves it the same way.

## Personal data

Beneficial owners' names and country-level nationality/residence
(never a street address) are served under Bruce's build-names ruling
(fleet #3329/#3332, verified live and free of login 2026-10-18/19). A
shared removal mechanism (`@pipeworx/shared`'s `applyRemovals`, the same
one `sos-entities` uses under the 2026-10-08 names-and-roles ruling)
withholds any name on request to support@pipeworx.io —
`withheld_by_removal_request` on every response says how many were
suppressed for that lookup.

## Data sources

- Registry Agency (Agentsia po vpisvaniyata), Commercial Register and
  Register of Non-Profit Legal Entities — the statutory register every
  Bulgarian legal entity's beneficial-ownership declaration is filed into
  under Bulgaria's anti-money-laundering law. The exact route lives only in
  `src/index.ts` (CLAUDE.md step 9b).

## A note on verification

This pack's live fetch was verified with `curl` (200, real data, no
account). A plain Node `fetch()` call to the same endpoint from this
development machine returned HTTP 500 with an empty body on several
attempts, while `curl` against the identical URL succeeded every time —
consistent with a WAF/CDN fingerprinting the TLS client rather than an
auth or rate-limit wall (no 401/403, no login redirect, just a bare 500).
The Cloudflare Workers runtime this pack actually runs under is neither
curl nor Node, so this is unresolved until the post-deploy live probe
confirms which side of that line it falls on. If it turns out blocked from
Workers too, the answer is the same as for any WAF block: document it, do
not try to defeat it.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "bulgaria-beneficial-owners": {
      "url": "https://gateway.pipeworx.io/bulgaria-beneficial-owners/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/bulgaria-beneficial-owners/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1863+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/bg_beneficial_owners \
  -H 'Content-Type: application/json' \
  -d '{"eik":"130007884"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/bg_beneficial_owners`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-bulgaria-beneficial-owners` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/bulgaria-beneficial-owners/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "bulgaria-beneficial-owners": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-bulgaria-beneficial-owners"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Bulgaria Beneficial Owners data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
