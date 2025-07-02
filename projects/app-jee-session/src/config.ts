export const config = {

  alertTimes: {
    default: {
      firstAlert: 300, // 5 min
      secondAlert: 450, // 7.5 min
      thirdAlert: 600 // 10 min
    },
    physics: {
      firstAlert: 450,
      secondAlert: 600,
      thirdAlert: 900
    },
    chemistry: {
      firstAlert: 180,
      secondAlert: 300,
      thirdAlert: 450
    },
    maths: {
      firstAlert: 450,
      secondAlert: 600,
      thirdAlert: 900
    },
    reasoning: {
      firstAlert: 300,
      secondAlert: 450,
      thirdAlert: 600
    }
  }
}