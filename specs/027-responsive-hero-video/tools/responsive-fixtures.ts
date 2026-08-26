export type CompositionId = 'compact' | 'desktop' | 'wide';
export type ContentCase = 'default' | 'long-title' | 'long-cta';
export type MediaCase = 'poster' | 'video-unavailable';

export interface HeroVideoFixture {
  fixtureId: string;
  contentCase: ContentCase;
  mediaCase: MediaCase;
  title: string;
  ctaLabel: string;
  ctaHref: string;
  poster: string;
  video: { src: string | null; available: boolean };
  locale: 'fr-BE';
  fontFamily: 'Montserrat';
}

export interface ViewportFixture {
  viewportId: string;
  width: number;
  height: number;
  expectedComposition: CompositionId;
  witnessId?: 'mobile-390' | 'tablet-834' | 'desktop-1200' | 'wide-1728';
  boundaryId?: 'desktop-start-minus-1' | 'desktop-start' | 'desktop-start-plus-1' | 'wide-start-minus-1' | 'wide-start' | 'wide-start-plus-1';
}

const baseline = {
  title: 'Le numéro 1 des portes HÖRMANN en Province de Liège !',
  ctaLabel: 'Contactez-nous',
  ctaHref: '/contact',
  poster: 'extract/figma/visual-parity/fixture-assets/hero-video--background--8eb8b969759a.jpg',
  locale: 'fr-BE' as const,
  fontFamily: 'Montserrat' as const,
};

export const heroVideoFixtures: readonly HeroVideoFixture[] = [
  { fixtureId: 'default-poster', contentCase: 'default', mediaCase: 'poster', ...baseline, video: { src: null, available: false } },
  { fixtureId: 'long-title-poster', contentCase: 'long-title', mediaCase: 'poster', ...baseline, title: 'Le numéro un des portes HÖRMANN sur mesure, de la conception à la pose et au service après-vente, pour chaque projet résidentiel ou professionnel en Province de Liège.', video: { src: null, available: false } },
  { fixtureId: 'long-cta-poster', contentCase: 'long-cta', mediaCase: 'poster', ...baseline, ctaLabel: 'Demander une étude personnalisée gratuite pour votre projet de porte', video: { src: null, available: false } },
  { fixtureId: 'default-video-unavailable', contentCase: 'default', mediaCase: 'video-unavailable', ...baseline, video: { src: 'https://media.example.invalid/hero-video.mp4', available: false } },
] as const;

export const thirteenWidthFixtures: readonly ViewportFixture[] = [
  { viewportId: '320', width: 320, height: 640, expectedComposition: 'compact' },
  { viewportId: '390', width: 390, height: 844, expectedComposition: 'compact', witnessId: 'mobile-390' },
  { viewportId: '834', width: 834, height: 1112, expectedComposition: 'compact', witnessId: 'tablet-834' },
  { viewportId: '991', width: 991, height: 800, expectedComposition: 'compact', boundaryId: 'desktop-start-minus-1' },
  { viewportId: '992', width: 992, height: 800, expectedComposition: 'desktop', boundaryId: 'desktop-start' },
  { viewportId: '993', width: 993, height: 800, expectedComposition: 'desktop', boundaryId: 'desktop-start-plus-1' },
  { viewportId: '1024', width: 1024, height: 800, expectedComposition: 'desktop' },
  { viewportId: '1200', width: 1200, height: 800, expectedComposition: 'desktop', witnessId: 'desktop-1200' },
  { viewportId: '1399', width: 1399, height: 800, expectedComposition: 'desktop', boundaryId: 'wide-start-minus-1' },
  { viewportId: '1400', width: 1400, height: 800, expectedComposition: 'wide', boundaryId: 'wide-start' },
  { viewportId: '1401', width: 1401, height: 800, expectedComposition: 'wide', boundaryId: 'wide-start-plus-1' },
  { viewportId: '1440', width: 1440, height: 800, expectedComposition: 'wide' },
  { viewportId: '1728', width: 1728, height: 720, expectedComposition: 'wide', witnessId: 'wide-1728' },
] as const;

export const shortLandscapeFixture: ViewportFixture = {
  viewportId: 'short-landscape-844x390',
  width: 844,
  height: 390,
  expectedComposition: 'compact',
};

export const fourWitnessFixtures = thirteenWidthFixtures.filter((fixture): fixture is ViewportFixture & Required<Pick<ViewportFixture, 'witnessId'>> => Boolean(fixture.witnessId));

export function compositionAt(width: number): CompositionId {
  if (width >= 1400) return 'wide';
  if (width >= 992) return 'desktop';
  return 'compact';
}

export function fixtureDigestInput(fixture: HeroVideoFixture, viewport: ViewportFixture): Record<string, unknown> {
  return {
    fixtureId: fixture.fixtureId,
    contentCase: fixture.contentCase,
    mediaCase: fixture.mediaCase,
    poster: fixture.poster,
    videoAvailable: fixture.video.available,
    locale: fixture.locale,
    fontFamily: fixture.fontFamily,
    viewport: { width: viewport.width, height: viewport.height },
    composition: viewport.expectedComposition,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify({ heroVideoFixtures, thirteenWidthFixtures, shortLandscapeFixture, fourWitnessFixtures }, null, 2));
}
