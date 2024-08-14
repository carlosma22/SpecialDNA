import { Request, Response } from 'express';
import { AnalyzeDnaDto } from '../dtos/analyzeDna.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateDnaCommand } from '../commands/CreateDna.command';
import { CreateDnaCommandHandler } from '../handlers/createDnaCommand.handler';
import { GetDnaStatsQueryHandler } from '../handlers/getDnaStatsQuery.handler';

/**
 * @swagger
 * tags:
 *   name: DNA
 *   description: DNA analysis and statistics
 */

export class DnaController {

  /**
   * @swagger
   * /dna/analyze:
   *   post:
   *     summary: Analyze a DNA sequence to determine if it is special.
   *     tags: [DNA]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AnalyzeDnaDto'
   *     responses:
   *       200:
   *         description: The DNA analysis is special.
   *       403:
   *         description: The DNA analysis is not special.
   *       422:
   *         description: Validation error.
   *       500:
   *         description: Internal server error.
   */
  async analyzeDna(req: Request, res: Response): Promise<void> {
    try {
      const analyzeDnaDto = plainToClass(AnalyzeDnaDto, req.body);
      const errors = await validate(analyzeDnaDto);

      if (errors.length) {
        res.status(422).json({
          status: false,
          errors: Object.values(errors[0]?.constraints || '')
        });
        return;
      }
      
      const { dna } = req.body;
      const command = new CreateDnaCommand(dna);
      const handler = new CreateDnaCommandHandler();
      const isSpecial = await handler.handle(command);
      
      if (isSpecial) {
        res.json({ isSpecial });
      } else {
        res.status(403).json({ isSpecial });
      }
    } catch (error: any) {
      res.status(500).json({
        status: false,
        errors: error.message
      });
    }
  }

  /**
   * @swagger
   * /dna/stats:
   *   get:
   *     summary: Get statistics of DNA sequences analyzed.
   *     tags: [DNA]
   *     responses:
   *       200:
   *         description: Statistics retrieved successfully.
   *       500:
   *         description: Internal server error.
   */
  async getDnaStats(req: Request, res: Response): Promise<any> {
    try {
      const handler = new GetDnaStatsQueryHandler();
      const stats = await handler.handle();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching DNA statistics.' });
    }
  }
}
