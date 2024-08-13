import {
  IsArray,
  ArrayNotEmpty,
  Validate,
  ValidatorConstraint,
} from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     AnalyzeDnaDto:
 *       type: object
 *       properties:
 *         dna:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of DNA sequences to be analyzed. Must be NxN and only contain A, T, C, G.
 *           example: ["ATCG", "TAGC", "CGTA", "GCAT"]
 */

@ValidatorConstraint({ name: 'isNxN', async: false })
export class IsNxN {
  validate(dna: string[]) {
    if (!Array.isArray(dna) || dna.length === 0) {
      return true;
    }    
    return dna.every(str => str.length === dna.length);
  }

  defaultMessage() {
    return 'The DNA sequence must be NxN.';
  }
}

@ValidatorConstraint({ name: 'ValidDnaChars', async: false })
export class ValidDnaChars {
  validate(dna: string[]) {
    if (!Array.isArray(dna) || dna.length === 0) {
      return true;
    }

    const regex = /^[ATCG]+$/;
    return dna.every(str => regex.test(str));
  }

  defaultMessage() {
    return 'The DNA sequence should only contain the letters A, T, C, G.';
  }
}

export class AnalyzeDnaDto {
  @IsArray({ message: 'The DNA sequence must be an array.' })
  @ArrayNotEmpty({ message: 'The DNA sequence should not be empty.' })
  @Validate(IsNxN)
  @Validate(ValidDnaChars)
  dna: string[] = [];
}
