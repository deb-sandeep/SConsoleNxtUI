export type GameConfig = {
    duration: number,
    addition: {
        enabled: boolean,
        lhsMin: number,
        lhsMax: number,
        rhsMin: number,
        rhsMax: number
    },
    subtraction: {
        enabled: boolean
    },
    multiplication: {
        enabled: boolean,
        lhsMin: number,
        lhsMax: number,
        rhsMin: number,
        rhsMax: number
    },
    division: {
        enabled: boolean
    }
}
