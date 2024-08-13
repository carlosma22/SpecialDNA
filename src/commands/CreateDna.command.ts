export class CreateDnaCommand {
  public readonly sequence: string[];

  constructor(dna: string[]) {
      this.sequence = dna;
  }

  public isSpecial(): boolean {
      return this.sequence.some(sequence => /([ACGT])\1{3}/.test(sequence));
  }
}
