export class DnaEventModel {
  constructor(
      public readonly id: string,
      public readonly eventType: string,
      public readonly data: any,
      public readonly timestamp: number = Date.now()
  ) {}
}