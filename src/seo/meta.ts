import { company, partnership } from '@/data/site'

export const SITE_URL = 'https://kurt-transport.com'

export type PageMeta = {
  path: string
  title: string
  description: string
}

/** One entry per prerendered route. The build script reads this same list, so a page
 *  can never ship with the head tags of another. */
export const pages: PageMeta[] = [
  {
    path: '/',
    title: 'KURT Internationale Transporte GmbH — Spedition in Ulm',
    description:
      'Spedition aus Ulm für nationale und internationale Transporte: hängende Bekleidung, temperaturgeführte Ladung, Filialbelieferung und Sondertransporte. ISO 9001, ISO 27001 und IFS zertifiziert.',
  },
  {
    path: '/leistungen',
    title: 'Leistungen — Branchenlösungen | KURT Internationale Transporte',
    description:
      'Filialbelieferung ohne Rampe, hängende Fertigbekleidung bei 2,75 m Innenhöhe, temperaturgeführte Transporte mit Echtzeitprotokollierung, Schwer- und Sondertransporte sowie ein weltweites Projektladungsnetzwerk.',
  },
  {
    path: '/fuhrpark',
    title: 'Fuhrpark — sechs Fahrzeugtypen | KURT Internationale Transporte',
    description:
      'Textil-Koffersattel und Koffersattel mit Hebebühne (je 13,60 m, XL-CODE), Kühlauflieger, 12-t- und 7,49-t-LKW sowie Euro-6-Sattelzugmaschinen. Gewartet vom eigenen Fuhrparkteam in Ulm.',
  },
  {
    path: '/angebot',
    title: 'Unverbindliches Angebot anfordern | KURT Internationale Transporte',
    description:
      'Transportanfrage in unter zwei Minuten: Ladestelle, Entladestelle, Gewicht und Maße angeben — Sie erhalten werktags innerhalb von 24 Stunden ein verbindliches Angebot aus Ulm.',
  },
  {
    path: '/kontakt',
    title: 'Kontakt — Hörvelsingerweg 52/2, 89081 Ulm | KURT Internationale Transporte',
    description:
      'KURT Internationale Transporte GmbH, Hörvelsingerweg 52/2, 89081 Ulm. Telefon +49 731 401 700, info@kurt-transport.com. Erreichbar Mo–Fr von 7:00 bis 17:00 Uhr.',
  },
]

export const metaFor = (path: string) => pages.find((p) => p.path === path) ?? pages[0]

/** LocalBusiness schema. The live site has none at all, which is the single biggest
 *  reason it is invisible for "Spedition Ulm"-style local queries. */
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MovingCompany',
  '@id': `${SITE_URL}/#organization`,
  name: company.name,
  alternateName: 'KURT Transporte',
  url: SITE_URL,
  telephone: company.phone,
  faxNumber: company.fax,
  email: company.email,
  slogan: company.motto,
  address: {
    '@type': 'PostalAddress',
    streetAddress: company.street,
    postalCode: company.zip,
    addressLocality: company.city,
    addressCountry: 'DE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: company.geo.lat,
    longitude: company.geo.lng,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '17:00',
    },
  ],
  // Die Partnerschaft mit dem SSV Ulm belegt die regionale Verankerung — fuer
  // lokale Suchanfragen ein echtes Signal. Live existiert sie nur als Logo mit
  // leerem alt-Attribut und ist damit maschinell unsichtbar.
  sponsor: {
    '@type': 'SportsTeam',
    name: partnership.name,
  },
  areaServed: [
    { '@type': 'Country', name: 'Deutschland' },
    { '@type': 'Place', name: 'West- und Zentraleuropa' },
    { '@type': 'Country', name: 'Türkei' },
    { '@type': 'Country', name: 'Griechenland' },
  ],
  hasCredential: [
    'DIN EN ISO 9001:2015',
    'DIN ISO 27001:2013',
    'IFS Progress Logistics 2024',
  ],
}
