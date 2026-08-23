/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/reassurances.contract.json (ds.reassurances v1.3.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { SectionHeader } from '../SectionHeader';
import { Carte } from '../Carte';
import { Button } from '../Button';
import styles from './Reassurances.module.css';

export interface ReassurancesProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: '4Cartes' | 'quatrecartesdeuxcta' | '5Cartes';
  /** Les cartes de réassurance, fournies par le consommateur. imageUrl alimente ds.carte.imageUrl : le master pose une peinture IMAGE distincte par carte (imageRef ab6a82d4b83b657d48c90b5e253f82459fd505bf, 8d05df2058fe88fa4b14e4472c9746f03fd100a2, d00de3d48206b57be5125a2d01e8595d3eca56de, 7bd2daf5061e3af6ff4a671f8eca2be1bc10b6fb, relevées sur I2114:3614;2063:1607 … I2114:3617;2063:1607) et Figma n'expose aucune propriété de composant pour ces pixels. Le contrat porte donc la ROUTE, jamais les octets — même convention que ds.hero.backgroundUrl et ds.sav.imageUrl, et le sample laisse imageUrl vide parce qu'un imageRef Figma n'est pas une URL. */
  items?: Array<{ texte: string; titre: string; imageUrl: string }>;
}

/** Piqueray Reassurances. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v1.3.0 porte les variantes en grille native : 4 colonnes pour « 4 cartes » et « QuatreCartesDeuxCta », 5 pour « 5 cartes » ; les cartes remplissent leur piste. Les 285px observés à 1550px de conteneur étaient une mesure dérivée, jamais une règle de dimension. Le champ items.imageUrl est ajouté pour que les photos des cartes aient une ROUTE de projection (D10 : l'URL n'est jamais un défaut du contrat, elle entre par le consommateur). */
export const Reassurances = forwardRef<HTMLDivElement, ReassurancesProps>(function Reassurances(
  { disposition = '4Cartes', items, className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`disposition-${disposition}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <SectionHeader
        titre={[{ text: 'Pourquoi choisir nos portes de garage industrielles ?' }]}
        accroche="Plus de 50 ans d’expérience"
        accroche2
        disposition="standard"
      />
      <div className={styles.items}>
        {items?.map((item, index) => (
          <Carte
            key={index}
            disposition="reassurance"
            texte={[{ text: item.texte }]}
            titre={item.titre}
            imageUrl={item.imageUrl}
          />
        ))}
      </div>
      {disposition === '5Cartes' ? (
        <Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">
          Contactez-nous
        </Button>
      ) : null}
      {disposition === 'quatrecartesdeuxcta' ? (
        <div className={styles.Boutons}>
          {disposition === 'quatrecartesdeuxcta' ? (
            <Button
              variant="outlineNoir"
              iconLeft
              iconLeftGlyph="pdf"
              iconRight
              iconRightGlyph="download"
            >
              Motifs disponibles
            </Button>
          ) : null}
          {disposition === 'quatrecartesdeuxcta' ? (
            <Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">
              Contactez-nous
            </Button>
          ) : null}
        </div>
      ) : null}
      {disposition === '4Cartes' ? (
        <Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">
          Contactez-nous
        </Button>
      ) : null}
    </div>
  );
});
