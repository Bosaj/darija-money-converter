import type { Motif } from '../../data/money'

/**
 * One-stroke line drawings (24 × 24 box, drawn with a round-capped stroke, no fill) for the motifs
 * on Moroccan notes and coins. Kept simple on purpose: they are seen small and faded.
 */
export const GLYPHS: Record<Motif, string> = {
  // Al Quaraouiyine: horseshoe arch
  arch: 'M3 21h18M5 21V11a7 7 0 0 1 14 0v10M8.5 21v-8.5a3.5 3.5 0 0 1 7 0V21M3 11h2M19 11h2M12 4V2',
  argan: 'M12 21v-6M9 21h6M12 15c-5 0-9-2.2-9-5.5S7 4 12 4s9 2.2 9 5.5-4 5.5-9 5.5ZM8 9.5h.01M12 8h.01M16 10h.01M10 12h.01M14 12h.01',
  bee: 'M8 12a4 3 0 1 0 8 0a4 3 0 1 0-8 0M11 9.3v5.4M13.5 9.6v4.8M12 9c-2-4-6-4-6-1s3 2 6 1ZM12 9c2-4 6-4 6-1s-3 2-6 1ZM16 12h3M5 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0',
  // cable-stayed bridge (Mohammed VI Bridge)
  bridge: 'M2 16h20M7 16V5M17 16V5M7 6l-4 10M7 6l3 10M17 6l4 10M17 6l-3 10M2 20c2.5-1.5 5 1.5 7.5 0s5 1.5 7.5 0 3.5 1 5 0',
  crown: 'M4 17h16l1.5-9-5 4L12 5l-4.5 7-5-4ZM4 20.5h16',
  dam: 'M3 5h18M5 5l2 15h10l2-15M7.5 9h9M8 13h8M8.5 17h7M2 21c3-1.2 6 1.2 10 0s7 1.2 10 0',
  // Ouzoud Falls
  falls: 'M3 4h18M6 4v11M10 4v15M14 4v15M18 4v11M3 19c3-2 6 2 9 0s6 2 9 0M4 15.5c1 1 2 1 3 0M17 15.5c1 1 2 1 3 0',
  fish: 'M3 12c4-5.5 10-5.5 14 0-4 5.5-10 5.5-14 0ZM17 12l4-3.5v7ZM7 11h.01M11 9.5c1 1.5 1 3.5 0 5',
  fortress: 'M3 21V9h3v2h2V9h3v2h2V9h3v2h2V9h3v12ZM10 21v-4.5a2 2 0 0 1 4 0V21M6 14h1M17 14h1',
  // a bab: horseshoe arch in a square frame
  gate: 'M3 21V6h18v15M8 21v-7.5a4 4 0 0 1 8 0V21M3 9h18M6 6l1-3h10l1 3M2 21h20',
  // Seal of Solomon, on Hassani coins and early franc coins
  hexagram: 'M12 2.5l8.2 14.2H3.8ZM12 21.5L3.8 7.3h16.4Z',
  // fantasia rider
  horse: 'M3 20l2.5-5.5L9 13h6l2.5-3H20l1 1.5-2 2v3.5l1 3M9 13l-1 7M15 13.5l.5 6.5M11 13V9l1.5-2 1.5 1v4.5M11.5 6a1 1 0 1 0 2 0a1 1 0 1 0-2 0M9.5 9.5l9-4',
  // fibula brooch
  jewel: 'M5 5h14l-7 14ZM12 5v14M8.5 5a3.5 3.5 0 0 1 7 0M10.5 10a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M9 21l3-2 3 2',
  kasbah: 'M3 21V10l3-2 3 2V7l3-2 3 2v3l3-2 3 2v11ZM10 21v-4h4v4M6 13h1M17 13h1M12 9h.01',
  lighthouse: 'M9 21l1.5-12h3L15 21ZM8.5 9h7M10 9V6h4v3M12 6V4M3 7l5 1M21 7l-5 1M10.3 14h3.4M6 21h12',
  lily: 'M3 17.5c3 2 15 2 18 0M12 15c-3 0-5-3-5-6 3 0 5 3 5 6ZM12 15c3 0 5-3 5-6-3 0-5 3-5 6ZM12 15c-1.6-3-1.6-6 0-9 1.6 3 1.6 6 0 9ZM5 20.5h4M15 20.5h4',
  // oud
  lute: 'M13.5 10.5 20 4M18.5 2.5l3 3M5 19a5.5 5.5 0 0 1 0-7.8l3-3a5.5 5.5 0 0 1 7.8 7.8l-3 3A5.5 5.5 0 0 1 5 19ZM7 15a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0',
  // Place Mechouar, Laayoune: arcades and a flag
  mechouar: 'M2 21h20M3 21v-7h18v7M6 21v-3.5a1.5 1.5 0 0 1 3 0V21M10.5 21v-3.5a1.5 1.5 0 0 1 3 0V21M15 21v-3.5a1.5 1.5 0 0 1 3 0V21M3 14l2-3h14l2 3M12 11V4l4 1.5L12 7',
  // Hassan II Mosque: tall minaret beside the prayer hall
  mosque: 'M2 21h20M4 21v-6h11v6M6.5 15a3 3 0 0 1 6 0M16 21V5h3.5v16M16 8h3.5M17.75 5V2.5M17.2 12h1.1',
  olive: 'M4 20C9 15 14 9.5 20 4M8.5 15.5c-2.2-.6-3.3-2.6-2.7-4.8 2.2.6 3.3 2.6 2.7 4.8ZM12.5 11.5c2.2.6 4.2-.5 4.8-2.7-2.2-.6-4.2.5-4.8 2.7ZM14 16a1.8 2.5 0 1 0 3.6 0a1.8 2.5 0 1 0-3.6 0',
  oranges: 'M4 16a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 16a4 4 0 1 0 8 0a4 4 0 1 0-8 0M8 9a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 5c1-2 3-3 5-2.5-1 2-3 3-5 2.5Z',
  // eight-point zellige star, for notes whose vignette is ornamental
  ornament: 'M6 6h12v12H6ZM12 3.5l8.5 8.5-8.5 8.5L3.5 12ZM9.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
  palm: 'M12 21V10M9 21h6M12 10C9.5 6.5 5.5 6 3 8M12 10c2.5-3.5 6.5-4 9-2M12 10c-1.5-3-4-5-7-5M12 10c1.5-3 4-5 7-5M12 10c0-3 .5-5.5 1.5-7',
  rose: 'M10 11.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0M9 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0M14.7 10.1a3 3 0 1 0 6 0a3 3 0 1 0-6 0M12.5 16.9a3 3 0 1 0 6 0a3 3 0 1 0-6 0M5.5 16.9a3 3 0 1 0 6 0a3 3 0 1 0-6 0M3.3 10.1a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
  // dhow
  sailship: 'M3 17h18l-3 4H6ZM12 17V3M12 4.5l6.5 11H12M12 7 6 15.5h6',
  // container ship and port crane
  ship: 'M2 15.5h15l-2 4.5H4ZM5 15.5V12h3v3.5M8.5 15.5v-5h3v5M12 15.5v-3h3v3M18 20V5M18 5h4M18 5l-4 3M22 5v4M2 21.5c3-1 6 1 10 0s7 1 10 0',
  skyline: 'M2 21h20M3 21V11h4v10M7 21V6h5v15M12 21V9h4v12M16 21v-8h5v8M9 9h1M9 12h1M9 15h1M14 12h.01M18.5 16h.01',
  // solar panel and wind turbine
  solar: 'M2 14l3-7h10l3 7ZM6.5 7 5.5 14M10 7v7M13.5 7l1 7M3.2 10.5h13.6M10 14v4M7 18h6M20 21V9M20 9l-3-3M20 9l3.5 1M20 9l-.5 4.5',
  // five-point star of the flag
  star: 'M12 3.5L17.3 19.8L3.45 9.7L20.55 9.7L6.7 19.8Z',
  // Sahrawi tent
  tent: 'M2 20 12 5l10 15ZM12 5v15M9 20l3-5 3 5M1 20h22',
  tower: 'M9 21C9 13 10.5 7 13 3c.8 4.5 2 11 2 18ZM8 21h8M10.6 9h3M10 14h4.2',
  train: 'M4 16V9a3 3 0 0 1 3-3h9l4 4.5V16ZM4 12h16M7 9h4M7 19l2-3M17 19l-2-3M2 19.5h20',
  turbine: 'M12 10v11M10 21h4M12 10 9 3.5M12 10l6.5 2M12 10l-5.5 4.5M10.8 10a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0',
  wheat:
    'M12 21V4M12 8c-2.5 0-3.5-1.5-3.5-3.5 2.5 0 3.5 1.5 3.5 3.5ZM12 8c2.5 0 3.5-1.5 3.5-3.5-2.5 0-3.5 1.5-3.5 3.5ZM12 12.5c-2.5 0-3.5-1.5-3.5-3.5 2.5 0 3.5 1.5 3.5 3.5ZM12 12.5c2.5 0 3.5-1.5 3.5-3.5-2.5 0-3.5 1.5-3.5 3.5ZM12 17c-2.5 0-3.5-1.5-3.5-3.5 2.5 0 3.5 1.5 3.5 3.5ZM12 17c2.5 0 3.5-1.5 3.5-3.5-2.5 0-3.5 1.5-3.5 3.5Z',
}
