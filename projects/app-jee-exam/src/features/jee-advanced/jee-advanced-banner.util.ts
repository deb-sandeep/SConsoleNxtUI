// JEE Advanced 2027 runs in May 2027; the banner switches to the next exam cycle
// once that exam is behind us.
const BANNER_CUTOVER_DATE = new Date( 2027, 5, 1 ) ;

function getJeeAdvancedBannerYear( now: Date = new Date() ): number {
  return now < BANNER_CUTOVER_DATE ? 2027 : 2028 ;
}

export function getJeeAdvancedBannerImage( now: Date = new Date() ): string {
  return `img/jee-adv-banner-${ getJeeAdvancedBannerYear( now ) }.png` ;
}

export function getJeeAdvancedBannerImages( now: Date = new Date() ): { lhs: string, rhs: string } {
  const year = getJeeAdvancedBannerYear( now ) ;
  return {
    lhs: `img/jee-adv-banner-${ year }-lhs.png`,
    rhs: `img/jee-adv-banner-${ year }-rhs.png`,
  } ;
}