# Umgebungs-Befund (behoben)

## Kaputter Node-Shim — blockierte node, npm und npx systemweit

**Status: am 2026-10-19 behoben.** Dokumentiert, weil der Fehler schwer zu finden war und
sich jederzeit wiederholen kann, falls ein Tool die Datei erneut anlegt.

### Was los war

`/Users/tolgahisir/.local/bin/node` war eine **0 Byte grosse, leere, ausführbare Datei**,
datiert auf den 4. Februar 2026.

In `~/.zshrc` steht in der letzten PATH-Zeile:

```sh
export PATH="$HOME/.local/bin:$PATH"
```

Sie läuft nach der Node-Zeile und schiebt `~/.local/bin` damit ganz nach vorn — vor den
Homebrew-Node. Jedes npm-CLI startet per `#!/usr/bin/env node`, fand diese leere Datei,
führte sie aus, und sie tat nichts.

### Warum es so lange unentdeckt blieb

Der Fehlermodus war **kein** Fehler:

```
node -v  ->  (keine Ausgabe)   exit=0
npm -v   ->  (keine Ausgabe)   exit=0
```

Exit-Code 0 und leere Ausgabe. Skripte „liefen durch", ohne irgendetwas zu tun. Betroffen
war nicht nur dieses Projekt, sondern jedes Node-Projekt auf dem Rechner — nachgestellt und
bestätigt in `golightning-website`.

### Behebung

```sh
rm ~/.local/bin/node
```

Danach löst `node` wieder korrekt auf, ohne dass irgendwo ein PATH-Export nötig wäre:

```
node -> /opt/homebrew/opt/node@22/bin/node
node -v: v22.23.3
npm  -v: 10.9.9
```

Die beiden `graphify`-Symlinks in `~/.local/bin` sind davon unberührt und weiterhin intakt.

### Erkennungsmerkmal für die Zukunft

Wenn `node -v` nichts ausgibt und trotzdem mit 0 endet, zuerst prüfen:

```sh
command -v node        # sollte /opt/homebrew/... zeigen, nicht ~/.local/bin
ls -la ~/.local/bin/node
```
