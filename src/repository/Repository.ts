export class Repository<T> {
  private dbContext: any;

  constructor(context: T) {
    this.dbContext = context;
  }

  async getAll(whereClause: any): Promise<T[]> {
    let result = await this.dbContext.findAll({
      where: whereClause,
    });
    return result;
  }
  async getOne(whereClause: any): Promise<T> {
    let result = await this.dbContext.findOne({
      where: whereClause,
    });
    return result;
  }
  async create<S>(payload: S): Promise<T> {
    let result = await this.dbContext.create(payload);
    return result;
  }
}
