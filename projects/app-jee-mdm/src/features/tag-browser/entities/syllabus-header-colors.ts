import Color from "colorjs.io";

// Derives a syllabus-header/topic-header color pair from a syllabus's raw
// SyllabusSO.color, the same colorjs.io-based technique
// manage-tracks/util/colors.ts uses for its track title bars (hsl
// lightness=20 for a strong/dark shade, hwb whiten=60 for a light tint) —
// not imported directly from there since it's a different feature, but kept
// numerically identical so syllabus/track coloring reads consistently
// across the app.
export type SyllabusHeaderColors = {
  syllabusBg:string, syllabusFg:string,
  topicBg:string, topicFg:string,
}

const cache = new Map<string, SyllabusHeaderColors>() ;

export function syllabusHeaderColors( hex:string ):SyllabusHeaderColors {
  const cached = cache.get( hex ) ;
  if( cached ) return cached ;

  const strong = new Color( hex ) ;
  strong.hsl[ 'l' ] = 20 ;
  const syllabusBg = strong.toString( { format:'hex' } ) ;

  const light = new Color( hex ) ;
  light.hwb[ 'w' ] = 60 ;
  const topicBg = light.toString( { format:'hex' } ) ;

  const colors:SyllabusHeaderColors = { syllabusBg, syllabusFg:'#fff', topicBg, topicFg:syllabusBg } ;
  cache.set( hex, colors ) ;
  return colors ;
}
