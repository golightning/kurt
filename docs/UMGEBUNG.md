# Umgebungs-Befund

## Kaputter Node-Shim (blockiert node, npm und npx systemweit)

`/Users/tolgahisir/.local/bin/node` ist eine **0 Byte grosse, leere Datei**.
Da `~/.local/bin` in der `PATH` vor Homebrew steht, wird sie statt des echten
Node gefunden. Jedes npm-/npx-CLI startet per `#!/usr/bin/env node` und
scheitert dadurch **lautlos** — kein stdout, kein Fehlertext.

Echter Node: `/opt/homebrew/opt/node@22/bin/node` (v22.23.3, npm 10.9.9).

### Dauerhafte Loesung (im Terminal ausfuehren)

```sh
rm /Users/tolgahisir/.local/bin/node
node -v   # muss v22.23.3 zeigen
```

### Workaround in diesem Projekt

Alle npm-Aufrufe laufen mit vorangestelltem PATH:

```sh
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```
