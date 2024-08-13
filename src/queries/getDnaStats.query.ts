import { DnaEntity } from "../entities/dna.entity";
import { appDataSource } from "../main";

export class GetDnaStatsQuery {
  async execute() {
    try {
      const dnaRepository = appDataSource.getRepository(DnaEntity);
          
      const result = await dnaRepository
          .createQueryBuilder("Dna")
          .select("SUM(CASE WHEN isSpecial = TRUE THEN 1 ELSE 0 END)", "count_special_dna")
          .addSelect("SUM(CASE WHEN isSpecial = FALSE THEN 1 ELSE 0 END)", "count_ordinary_dna")
          .getRawOne();

      const countSpecialDna = parseInt(result?.count_special_dna || '0');
      const countOrdinaryDna = parseInt(result?.count_ordinary_dna || '0');
      const ratio = countOrdinaryDna ? countSpecialDna / countOrdinaryDna : 0;
      
      return {
        count_special_dna: countSpecialDna,
        count_ordinary_dna: countOrdinaryDna,
        ratio: parseFloat(ratio.toFixed(2)),
      };
    } catch (error: any) {
      throw Error(`Error: ${error.message || error}`);
    }
  }
}
