import { CreateDnaCommand } from "../src/commands/CreateDna.command";

describe('CreateDnaCommand', () => {

  describe('constructor', () => {
    it('should initialize with a given DNA sequence', () => {
      const dnaSequence = ['ATCG', 'GCTA', 'TTTT', 'CGAT'];
      const command = new CreateDnaCommand(dnaSequence);

      expect(command.sequence).toEqual(dnaSequence);
    });
  });

  describe('isSpecial', () => {
    it('should return true if any sequence contains four consecutive identical characters', () => {
      const dnaSequence = ['AAAA', 'GCTA', 'CGAT', 'TTTT'];
      const command = new CreateDnaCommand(dnaSequence);

      const result = command.isSpecial();

      expect(result).toBe(true);
    });

    it('should return false if no sequence contains four consecutive identical characters', () => {
      const dnaSequence = ['ATCG', 'GCTA', 'CGAT', 'TGCA'];
      const command = new CreateDnaCommand(dnaSequence);

      const result = command.isSpecial();

      expect(result).toBe(false);
    });

    it('should handle mixed case sequences correctly', () => {
      const dnaSequence = ['aaAA', 'ccCC', 'ggGG', 'ttTT'];
      const command = new CreateDnaCommand(dnaSequence);

      const result = command.isSpecial();

      expect(result).toBe(false);
    });

    it('should return true for lower case sequences with four consecutive identical characters', () => {
      const dnaSequence = ['aaaa', 'cggt', 'acgt', 'tttt'];
      const command = new CreateDnaCommand(dnaSequence);

      const result = command.isSpecial();

      expect(result).toBe(false);
    });

    it('should return false for sequences shorter than 4 characters', () => {
      const dnaSequence = ['AT', 'GC', 'CG', 'TA'];
      const command = new CreateDnaCommand(dnaSequence);

      const result = command.isSpecial();

      expect(result).toBe(false);
    });
  });

});
