// Display-only — strips the "IIT " prefix syllabusName carries (e.g. "IIT
// Physics" -> "Physics"). The underlying syllabusName is still what's stored
// in TagBrowserFilters and sent to the server; only rendered labels use this.
export function syllabusDisplayName( syllabusName:string ):string {
  return syllabusName.replace( /^IIT\s+/, '' ) ;
}
