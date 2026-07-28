import React from 'react';
import { createRoot } from 'react-dom/client';
import { AccordionRow } from '../src/components/AccordionRow/AccordionRow';
import { FAQ } from '../src/components/FAQ/FAQ';
import '../src/styles/tokens.css';
const rows = [
  ['grand','ferme'],['grand','ouvert'],['petit','ferme'],['petit','ouvert'],
] as const;
createRoot(document.getElementById('root')!).render(<>
  <div id="matrix">{rows.map(([taille,etat]) => <AccordionRow key={`${taille}-${etat}`} data-cell={`${taille}-${etat}`} taille={taille} etat={etat} titre="Question" contenu="Réponse" />)}</div>
  <div id="independent"><FAQ items={[{titre:'A',contenu:'RA'},{titre:'B',contenu:'RB'},{titre:'C',contenu:'RC'}]} /></div>
</>);
