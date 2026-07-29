/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/piqueray-logo.contract.json (ds.piqueray-logo v0.1.0)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 */
import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

const ICONS: Record<string, string> = {
  "piqueray-logo-marque": "<svg width=\"25.96292495727539\" height=\"34\" viewBox=\"0 0 26 34\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M22.1055 24.8174L14.2798 29.2841V25.9386L22.1055 21.4551V24.8174ZM22.1055 20.2534L14.2798 24.7311V21.3133L22.1055 16.8312V20.2534ZM22.1055 15.6296L14.2798 20.1049V16.8365L22.1055 12.3545V15.6296ZM22.1055 11.1509L14.2798 15.6296L11.1246 13.6149L18.7416 9.09769L22.1055 11.1509ZM25.9629 26.5818V7.4177L12.9815 0L0 7.4177V26.5818L12.9815 34L25.9629 26.5818Z\" fill=\"currentColor\"/>\n</svg>",
  "piqueray-logo-wordmark": "<svg width=\"145.67019653320312\" height=\"25.00434112548828\" viewBox=\"0 0 146 25\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<g>\n<path d=\"M13.1842 0.0494995C13.8015 0.0494995 14.3304 0.272122 14.7716 0.717373C15.2121 1.16325 15.4327 1.7001 15.4327 2.32726V11.9325C15.4327 12.5934 15.2121 13.1455 14.7716 13.5914C14.3304 14.0373 13.8015 14.2599 13.1842 14.2599H4.58545V21.6866H0V0.0494995H13.1842ZM10.8912 4.65399H4.58545V9.6554H10.8912V4.65399Z\" fill=\"currentColor\"/>\n<path d=\"M25.5216 0.0488281H20.8402V21.6866H25.5216V0.0488281Z\" fill=\"currentColor\"/>\n<path d=\"M41.0675 25.0044L39.0675 21.6866H32.7046C32.0377 21.6866 31.477 21.4729 31.0225 21.0429C30.568 20.6142 30.341 20.0697 30.341 19.4089V2.32726C30.341 1.7001 30.568 1.16325 31.0225 0.717373C31.477 0.272122 32.0377 0.0494995 32.7046 0.0494995H44.0675C44.7331 0.0494995 45.2944 0.272122 45.7489 0.717373C46.2035 1.16325 46.4304 1.7001 46.4304 2.32726V19.4089C46.4304 19.9711 46.2486 20.466 45.885 20.8947C45.5214 21.3241 45.0675 21.588 44.522 21.6866L46.5671 25.0044H41.0675ZM41.7496 4.65399H35.0224V17.0828H41.7496V4.65399Z\" fill=\"currentColor\"/>\n<path d=\"M64.6068 21.6867H53.537C52.8899 21.6867 52.3457 21.4724 51.9045 21.043C51.4639 20.6143 51.2433 20.0699 51.2433 19.409V0H55.8294V17.0822H62.3131V0H66.8999V19.409C66.8999 20.0699 66.6793 20.6143 66.2381 21.043C65.7975 21.4724 65.2527 21.6867 64.6068 21.6867Z\" fill=\"currentColor\"/>\n<path d=\"M75.8445 4.70387V8.66467H81.1826V13.2196H75.8445V17.132H85.5386V21.6869H71.5318V0.0491333H85.5386V4.70387H75.8445Z\" fill=\"currentColor\"/>\n<path d=\"M101.656 21.6866L97.2461 14.2599H93.9823V21.6866H89.4401V0.0494995H102.538C103.185 0.0494995 103.729 0.272122 104.17 0.717373C104.612 1.16325 104.831 1.7001 104.831 2.32726V11.9325C104.831 12.5934 104.612 13.1455 104.17 13.5914C103.729 14.0373 103.185 14.2599 102.538 14.2599L106.949 21.6866L101.656 21.6866ZM93.9823 9.65476H100.289V4.65336H93.9823V9.65476Z\" fill=\"currentColor\"/>\n<path d=\"M122.914 21.687L121.414 16.5864H114.269L112.726 21.687H108.051L114.358 0.098877H121.282L127.589 21.687H122.914ZM117.842 4.65376L115.637 11.9329H120.003L117.842 4.65376Z\" fill=\"currentColor\"/>\n<path d=\"M138.438 11.8089V21.7118H133.895V11.8089L126.662 0.0740356H132.881L136.188 5.37248L139.452 0.0740356H145.67L138.438 11.8089Z\" fill=\"currentColor\"/>\n</g>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "border": 0,
    "position": "relative",
    "width": "180px",
    "height": "34px"
  },
  "Marque": {
    "display": "inline-flex",
    "flexShrink": 0,
    "position": "absolute",
    "left": "0px",
    "top": "0px",
    "color": "#F98A0B"
  },
  "Wordmark": {
    "display": "inline-flex",
    "flexShrink": 0,
    "position": "absolute",
    "left": "34.329803466796875px",
    "top": "5.959875106811523px",
    "color": "#143A84"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "couleur-blanc:Wordmark": {
    "color": "#FFFFFF"
  }
};

export interface PiquerayLogoProps extends HTMLAttributes<HTMLDivElement> {
  couleur?: 'default' | 'blanc';
}

/** PROPOSED contract extracted from the design canvas (extract/figma dump v1) — API, anatomy, and token bindings inverted from the drawn structure. Semantics beyond the name/axis inference table, a11y, events, and slot accepts are not canvas-recoverable; review before adoption. */
export const PiquerayLogo = forwardRef<HTMLDivElement, PiquerayLogoProps>(function PiquerayLogo(
  { couleur = 'default', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <span style={{ ...S.Marque }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["piqueray-logo-marque"] }} />
<span style={{ ...S.Wordmark, ...(V[`couleur-${couleur}:Wordmark`] ?? {}) }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["piqueray-logo-wordmark"] }} />
    </div>
  );
});
