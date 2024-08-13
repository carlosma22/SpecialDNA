import { CreateDnaCommand } from "../commands/CreateDna.command";
import redisClient from "../database/redisClient";
import { DnaModel } from "../models/dna.model";
import { DnaEventModel } from "../models/dnaEvent.model";
import { StoreEvent } from "../events/store.event";
import { appDataSource } from "../main";


export class CreateDnaCommandHandler {
  private storeEvent = new StoreEvent();

  async handle(command: CreateDnaCommand): Promise<boolean> {
    const isSpecial = this.isSpecialDna(command.sequence);
    
    const dnaRepository = appDataSource.getRepository(DnaModel);
    const dnaRecord = new DnaModel();
    dnaRecord.sequence = command.sequence;
    dnaRecord.isSpecial = isSpecial;
    await dnaRepository.save(dnaRecord);
    
    const event = new DnaEventModel(
      dnaRecord.id, 
      'DNA_ANALYZED', 
      { sequence: command.sequence, isSpecial },
    ); console.log(event);
    
    await this.storeEvent.save(event);
    
    await this.updateStats(isSpecial);

    return isSpecial;
  }

  private isSpecialDna(dna: string[]): boolean {
    const n = dna.length;

    const checkSequence = (sequence: string): boolean => {
      return /(.)\1{3}/.test(sequence);
    };
    
    for (let i = 0; i < n; i++) {
      if (checkSequence(dna[i])) return true;
      
      let column = '';
      for (let j = 0; j < n; j++) {
        column += dna[j][i];      
      }
      
      if (checkSequence(column)) return true;
    }

    for (let i = 0; i < n - 3; i++) {
      let diag1 = '', diag2 = '', diag3 = '', diag4 = '';
      for (let j = 0; j < n - i; j++) {
        diag1 += dna[i + j][j];
        diag2 += dna[j][i + j];
        diag3 += dna[i + j][n - 1 - j];
        diag4 += dna[j][n - 1 - i - j];
      }
      
      if (
        checkSequence(diag1) || 
        checkSequence(diag2) || 
        checkSequence(diag3) || 
        checkSequence(diag4)
      ) {
        return true;
      }
    }
  
    return false;
  }

  private async updateStats(isSpecial: boolean): Promise<void> {
    const pipeline = redisClient.multi();
    
    if (isSpecial) {
        pipeline.incr('count_special_dna');
    } else {
        pipeline.incr('count_ordinary_dna');
    }

    await pipeline.exec();
}
}
