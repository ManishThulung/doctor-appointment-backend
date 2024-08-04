export class Repository<T> {
  private dbContext: any;

  constructor(context: any) {
    this.dbContext = context;
  }

  async getById(id: string): Promise<T> {
    let result = await this.dbContext.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    return result;
  }
}
