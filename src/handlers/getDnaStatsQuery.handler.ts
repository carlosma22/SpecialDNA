import redisClient from "../database/redisClient";
import { GetDnaStatsQuery } from "../queries/getDnaStats.query";

export class GetDnaStatsQueryHandler {
  async handle(): Promise<any> {
    try {
      let countSpecialDna = await redisClient.get('count_special_dna');
      let countOrdinaryDna = await redisClient.get('count_ordinary_dna');

      if (countSpecialDna === null || countOrdinaryDna === null) {
        const getDnaStatsQuery = new GetDnaStatsQuery();
        const stats = await getDnaStatsQuery.execute();
        
        countSpecialDna = stats?.count_special_dna.toString() || '0';
        countOrdinaryDna = stats?.count_ordinary_dna.toString() || '0';

        await redisClient.set('count_special_dna', countSpecialDna);
        await redisClient.set('count_ordinary_dna', countOrdinaryDna);
      }
        
      const countSpecial = parseInt(countSpecialDna);
      const countOrdinary = parseInt(countOrdinaryDna);
      const ratio = countSpecial ? countSpecial / countOrdinary : 0;
      
      return {
        count_special_dna: countSpecial,
        count_ordinary_dna: countOrdinary,
        ratio: parseFloat(ratio.toFixed(2)),
      };
    } catch (error: any) {
      throw Error(`Error: ${error.message || error}`);
    }
  }
}
