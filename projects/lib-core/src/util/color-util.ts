/**
 * Picks black or white — whichever reads better as text over `hexColor` —
 * using the YIQ perceived-brightness formula (the standard pragmatic
 * shortcut for this exact "chip background → legible text" problem; full
 * WCAG relative luminance is overkill for a binary choice).
 *
 * `hexColor` is typed `string` on `TagSO`, but some rows predate that field
 * and come back from the server as `null` — guarded here (the boundary
 * where server data enters the UI) rather than at every call site. Returns
 * `null` in that case rather than defaulting to black/white, so a
 * `[style.color]="getContrastingTextColor(tag.color)"` binding removes the
 * inline style entirely and falls back to whatever text color the caller's
 * own CSS already declares — mirroring how the paired background-color
 * binding already falls back to `null` for the same colorless tag.
 */
export function getContrastingTextColor( hexColor:string | null | undefined ):string | null {
  if( !hexColor ) return null ;
  const hex = hexColor.replace( '#', '' ) ;
  const r = parseInt( hex.substring( 0, 2 ), 16 ) ;
  const g = parseInt( hex.substring( 2, 4 ), 16 ) ;
  const b = parseInt( hex.substring( 4, 6 ), 16 ) ;
  const yiq = ( r * 299 + g * 587 + b * 114 ) / 1000 ;
  return yiq >= 128 ? '#000000' : '#ffffff' ;
}
