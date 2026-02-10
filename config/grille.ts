/**
 * Grille 4×4 from methodology. true = hole (X).
 *   X - - -
 *   - - - X
 *   - - X -
 *   - X - -
 */

export const GRILLE_SIZE = 4;

export const GRILLE_MATRIX_INITIAL: boolean[][] = [
  [true, false, false, false],
  [false, false, false, true],
  [false, false, true, false],
  [false, true, false, false],
];

export const grilleConfig = {
  size: GRILLE_SIZE,
  matrixInitial: GRILLE_MATRIX_INITIAL,
} as const;
