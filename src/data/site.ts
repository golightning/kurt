// Alle Inhalte stammen aus der Analyse von kurt-transport.com (siehe docs/ANALYSE.md).
// Tippfehler der Live-Seite sind hier korrigiert, Fakten unveraendert uebernommen.

export const company = {
  name: 'KURT Internationale Transporte GmbH',
  short: 'KURT',
  claim: 'Ganzheitliche Logistiklösungen',
  motto: 'Erfolg verlangt Umwege, doch wir streben nach Abkürzungen.',
  ceo: 'Oktay Kurt',
  street: 'Hörvelsingerweg 52/2',
  zip: '89081',
  city: 'Ulm',
  country: 'Deutschland',
  phone: '+49 731 401 700',
  phoneHref: '+49731401700',
  fax: '+49 731 401 7020',
  email: 'info@kurt-transport.com',
  hours: 'Mo – Fr, 7:00 – 17:00 Uhr',
  register: 'Amtsgericht Ulm',
  sister: 'Kurt. Cargo. Competence. GmbH',
  geo: { lat: 48.4258, lng: 9.9589 },
} as const

// Alle Angaben stammen aus den Zertifikatsscans auf /unsere-zertifizierungen/.
// Dort liegen sie ausschliesslich als Bilder mit leerem alt-Attribut: Geltungs-
// bereiche, Registriernummern und Laufzeiten sind weder durchsuchbar noch fuer
// Screenreader zugaenglich. Hier stehen sie als Text.
export const certifications = [
  {
    code: 'ISO 9001',
    full: 'DIN EN ISO 9001:2015',
    note: 'Qualitätsmanagement für den Transport von Komplettladungen und Stückgut.',
    scope: 'Transport von Komplettladungen und Stückgut',
    registry: '12 100 69275/01 TMS',
    issuer: 'TÜV SÜD Management Service GmbH',
    validUntil: '2028-05-01',
    validLabel: 'gültig bis 01.05.2028',
    image: '/img/zert/iso9001-kurt-transporte',
  },
  {
    code: 'IFS Logistics',
    full: 'IFS Progress Logistics, Version 1 (Foundation Level)',
    note: 'Lebensmittelsichere Logistik — bestätigt im Global Markets Assessment.',
    scope:
      'Straßentransport von verpackten, nicht kühlpflichtigen Lebensmitteln, Tierfutter, Drogerieartikeln und Non-Food-Produkten',
    registry: 'COID 85369 · 12 034 62016 TMS',
    issuer: 'TÜV SÜD Management Service GmbH',
    validUntil: '2025-05-09',
    validLabel: 'Assessment vom 12.03.2024',
    image: '/img/zert/ifs-progress-logistics',
  },
  {
    code: 'ISO 27001',
    full: 'DIN ISO 27001:2013',
    note: 'Informationssicherheit über alle Auftragsdaten hinweg.',
    // Kein Zertifikatsscan auf der Live-Seite und in den aktuellen Audit-Meldungen
    // nicht erwaehnt — belegt ist nur eine Neuigkeit von 2021. Deshalb ohne
    // Geltungsbereich, Registriernummer und Laufzeit: was nicht belegt ist, wird
    // hier nicht behauptet. Beim Inhaber nachfragen (siehe PITCH.md).
    scope: null,
    registry: null,
    issuer: null,
    validUntil: null,
    validLabel: null,
    image: null,
  },
  {
    code: 'ISO 9001',
    full: 'DIN EN ISO 9001:2015 — Kurt. Cargo. Competence. GmbH',
    note: 'Dieselbe Qualitätsnorm für die Schwestergesellschaft als Frachtenvermittler.',
    scope: 'Frachtenvermittler für Transporte von Komplettladungen und Stückgut',
    registry: '12 100 69275/02 TMS',
    issuer: 'TÜV SÜD Management Service GmbH',
    validUntil: '2028-05-01',
    validLabel: 'gültig bis 01.05.2028',
    image: '/img/zert/iso9001-kurt-cargo-competence',
  },
] as const

/** Offizieller Businesspartner des SSV Ulm 1846 Fussball. Auf der Live-Seite nur
 *  als Logo im Footer, mit leerem alt-Attribut — fuer Suchmaschinen und
 *  Screenreader also unsichtbar. */
export const partnership = {
  name: 'SSV Ulm 1846 Fußball',
  role: 'Offizieller Businesspartner',
  note: 'Regional verwurzelt: KURT unterstützt den Fußballverein der Stadt, in der das Unternehmen seit über 30 Jahren fährt.',
  logo: '/img/partner/ssv-ulm-businesspartner',
} as const

export type Service = {
  slug: string
  title: string
  teaser: string
  body: string
  facts: string[]
  image: string
}

export const services: Service[] = [
  {
    slug: 'filialbelieferung',
    title: 'Filialbelieferung',
    teaser: 'Zustellung bis an die Tür — auch ohne Rampenlager.',
    body: 'Für die direkte Zustellung an Filialen liefern wir auch ohne Rampenlager. Über die Hebebühne am Fahrzeug stellen wir Ihre Sendungen ebenerdig und ohne Zwischenschritte zu.',
    facts: ['Hebebühne am Fahrzeug', 'Ebenerdige Zustellung', 'Kein Rampenlager nötig'],
    image: '/img/komplett-zug-mit-amazon-2-1',
  },
  {
    slug: 'bekleidung-haengend',
    title: 'Bekleidung hängend',
    teaser: 'Fertigbekleidung im Spezialfahrzeug — bis zu 3-fach gehängt.',
    body: 'Wir transportieren Fertigbekleidung fachgerecht in speziellen Textilfahrzeugen. Bei einer Innenhöhe von 2,75 m ist eine 3-fach Hängung kurzer Oberteile oder eine 2-fach Hängung langer Bekleidung problemlos möglich.',
    facts: ['2,75 m Innenhöhe', '3-fach Hängung möglich', 'Textil-Koffersattel XL-CODE'],
    image: '/img/kurttransport-1-1',
  },
  {
    slug: 'temperaturgefuehrt',
    title: 'Temperaturgeführte Transporte',
    teaser: 'Frischdienst und TK mit lückenloser Echtzeitprotokollierung.',
    body: 'Mit temperaturgeführten Fahrzeugen ist der Einsatz im Frischdienst oder TK in definierten Temperaturbereichen selbstverständlich. Ausgestattet mit Echtzeitprotokollierung und Alarmmeldung bei Temperaturabweichung.',
    facts: ['Frischdienst & TK', 'Echtzeitprotokollierung', 'Alarm bei Abweichung'],
    image: '/img/Volvo-mit-Auflieger-Schneefall-2-1',
  },
  {
    slug: 'schwer-und-sondertransporte',
    title: 'Schwer- und Sondertransporte',
    teaser: 'Maßgeschneiderte Lösungen für ungewöhnliche Maße.',
    body: 'Besonders große Fracht oder Fracht mit ungewöhnlichen Maßen erfordert eine maßgeschneiderte Lösung — mit Spezialausrüstung und einem Transportkonzept, das individuell auf Ihre Fracht zugeschnitten ist.',
    facts: ['Spezialausrüstung', 'Individuelles Konzept', 'Begleitung ab Planung'],
    image: '/img/projektladung',
  },
  {
    slug: 'projektladungsnetzwerk',
    title: 'Projektladungsnetzwerk',
    teaser: 'Straße, Schiene oder Übersee — weltweit koordiniert.',
    body: 'Ob Straße, Schiene oder Übersee: Mit der Einsatzfreude und dem Know-how unseres Teams ist das Handling komplizierter Vorgänge für uns Alltag. Ihre Fracht trifft wie vereinbart pünktlich am Bestimmungsort ein — weltweit.',
    facts: ['Multimodal', 'Weltweites Netzwerk', 'Eine Ansprechperson'],
    image: '/img/LKW-3-2-scaled',
  },
] as const

export type Vehicle = {
  title: string
  spec: string
  use: string
}

export const fleet: Vehicle[] = [
  { title: '13,60 m Textil-Koffersattel', spec: 'XL-CODE', use: 'Hängende Fertigbekleidung, 2,75 m Innenhöhe' },
  { title: '13,60 m Koffersattel', spec: 'XL-CODE · Hebebühne', use: 'Filialbelieferung ohne Rampe' },
  { title: '13,60 m Kühlauflieger', spec: 'Frischdienst & TK', use: 'Temperaturgeführte Ladung mit Protokollierung' },
  { title: '12 t LKW', spec: 'Nahverkehr', use: 'Regionale Verteilung und Zustellung' },
  { title: '7,49 t LKW', spec: 'Nahverkehr', use: 'Feinverteilung in der Innenstadt' },
  { title: 'Sattelzugmaschinen', spec: 'Euro 6', use: 'Fernverkehr national und international' },
] as const

export const values = [
  {
    title: 'Sicherheit',
    body: 'Die Sicherheit unserer Fahrer und des anvertrauten Ladeguts hat oberste Priorität. Wir gewährleisten den einwandfreien technischen Zustand der gesamten Flotte.',
  },
  {
    title: 'Teamwork',
    body: 'Unser Erfolg beruht auf einem eingespielten Team aus langjährigen Mitarbeitenden. Mit ihrem Know-how erfüllen sie Ihre Transportanforderungen zuverlässig.',
  },
  {
    title: 'Transparente Kalkulation',
    body: 'Wir berechnen Transportkosten exakt und kalkulieren Preise präzise — damit Sie von Anfang an volle Transparenz haben.',
  },
  {
    title: 'Erreichbarkeit',
    body: 'Mo – Fr von 7:00 bis 17:00 Uhr erreichen Sie eine feste Ansprechperson, die Ihren Auftrag kennt. Keine Warteschleife, kein Ticketsystem.',
  },
] as const

export const sustainability = [
  { title: 'Lieferungen bündeln', body: 'Mehrere Lieferungen zu einer Buchung kombinieren — weniger Fahrten, geschonte Ressourcen.' },
  { title: 'Standzeiten senken', body: 'Zentrale Abwicklung reduziert Be- und Entladezeiten und minimiert Fahrzeugstillstand.' },
  { title: 'Leerfahrten vermeiden', body: 'Strategische Planung und konsequente Auslastung verhindern unnötige Leerfahrten.' },
  { title: 'Euro-6-Flotte', body: 'Moderne LKW nach Euro-6-Norm verbrauchen weniger Kraftstoff und emittieren weniger Schadstoffe.' },
  { title: 'Elektromobilität ausbauen', body: 'Der wachsende Einsatz von Elektrofahrzeugen senkt Emissionen im Nahverkehr.' },
  { title: 'Fahrerschulungen', body: 'Gezielte Schulungen verbessern Fahrverhalten, Effizienz und Sicherheit im Straßenverkehr.' },
] as const

export const reach = {
  national:
    'Im Bereich FTL sorgen wir dafür, dass Ihre Waren mit unserem modernen Fuhrpark pünktlich zugestellt werden. Mit einem motivierten Team erreichen wir durchgehend hohe Qualitätsmaßstäbe.',
  international:
    'Mit geschultem und zuverlässigem Fahrpersonal realisieren wir alle Ziele von West- und Zentraleuropa bis in die Türkei und nach Griechenland.',
} as const

export const nav = [
  { to: '/', label: 'Start' },
  { to: '/leistungen', label: 'Leistungen' },
  { to: '/fuhrpark', label: 'Fuhrpark' },
  { to: '/kontakt', label: 'Kontakt' },
] as const

export const ladungsarten = [
  'Palettierte Ware',
  'Hängende Bekleidung',
  'Temperaturgeführt (Frische)',
  'Temperaturgeführt (TK)',
  'Schwer- oder Sondertransport',
  'Projektladung',
  'Sonstiges',
] as const

export const transportarten = [
  'Komplettladung (FTL)',
  'Teilladung (LTL)',
  'Filialbelieferung',
  'National',
  'International',
] as const
