export interface LoginPasswordPair {
    login: string;
    password: string;
}

export class CBTLoginPasswordService {
    private static readonly TOTAL_PAIRS = 7;
    private static readonly LOGIN_PAIRS = 4;
    private static readonly PASSWORD_PAIRS = 3;

    /**
     * Generates the requested number of login/password pairs.
     *
     * Rules:
     * - Total 7 pairs of 2 digits each
     * - Pair 1 is random, with first digit non-zero (10 to 99)
     * - Pairs 2..7 are generated deterministically from the previous pair
     * - Login  = first 4 pairs concatenated => 8 digits
     * - Password = last 3 pairs concatenated => 6 digits
     */
    public static generateRandomLoginPassword(numPairs: number): LoginPasswordPair[] {
        if (!Number.isInteger(numPairs) || numPairs <= 0) {
            throw new Error("numPairs must be a positive integer.");
        }

        const result: LoginPasswordPair[] = [];

        for (let i = 0; i < numPairs; i++) {
            const seedPair = this.generateRandomSeedPair();
            const allPairs = this.buildPairSequence(seedPair);

            const login = allPairs.slice(0, this.LOGIN_PAIRS).join("");
            const password = allPairs.slice(this.LOGIN_PAIRS).join("");

            result.push({ login, password });
        }

        return result;
    }

    /**
     * Validates whether the supplied login and password satisfy the generation logic.
     *
     * Validation steps:
     * - login must be exactly 8 digits, first digit non-zero
     * - password must be exactly 6 digits
     * - extract first 2-digit pair from login
     * - regenerate the full 7-pair sequence
     * - compare derived login/password with supplied values
     */
    public static validateLoginPassword(login: string, password: string): boolean {
        if (!this.isValidLoginFormat(login) || !this.isValidPasswordFormat(password)) {
            return false;
        }

        const seedPair = parseInt(login.substring(0, 2), 10);
        const allPairs = this.buildPairSequence(seedPair);

        const expectedLogin = allPairs.slice(0, this.LOGIN_PAIRS).join("");
        const expectedPassword = allPairs.slice(this.LOGIN_PAIRS).join("");

        return login === expectedLogin && password === expectedPassword;
    }

    /**
     * Builds all 7 two-digit pairs from the seed.
     */
    private static buildPairSequence(seedPair: number): string[] {
        if (!Number.isInteger(seedPair) || seedPair < 10 || seedPair > 99) {
            throw new Error("Seed pair must be an integer from 10 to 99.");
        }

        const pairs: string[] = [this.toTwoDigitString(seedPair)];
        let current = seedPair;

        for (let i = 1; i < this.TOTAL_PAIRS; i++) {
            current = this.nextPair(current);
            pairs.push(this.toTwoDigitString(current));
        }

        return pairs;
    }

    /**
     * Deterministic algorithm to generate the next 2-digit pair from the previous one.
     *
     * You can change this formula later if you want a different sequence style.
     */
    private static nextPair(previous: number): number {
        return (previous * 37 + 11) % 100;
    }

    /**
     * Generates a random 2-digit seed pair from 10 to 99.
     */
    private static generateRandomSeedPair(): number {
        return Math.floor(Math.random() * 90) + 10;
    }

    /**
     * Formats a number as a 2-digit string, preserving leading zero if needed.
     */
    private static toTwoDigitString(value: number): string {
        return value.toString().padStart(2, "0");
    }

    /**
     * Login must be exactly 8 digits and first digit must be non-zero.
     */
    private static isValidLoginFormat(login: string): boolean {
        return /^[1-9][0-9]{7}$/.test(login);
    }

    /**
     * Password must be exactly 6 digits.
     */
    private static isValidPasswordFormat(password: string): boolean {
        return /^[0-9]{6}$/.test(password);
    }
}