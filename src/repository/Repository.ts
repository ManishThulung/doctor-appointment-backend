export class Repository<T> {
  private dbContext: any;

  constructor(context: T) {
    this.dbContext = context;
  }

  async getAll(whereClause: any): Promise<T[]> {
    let result = await this.dbContext.findAll({
      where: whereClause,
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    });
    return result;
  }
  async getAllWithAssociation(
    whereClause: any,
    include: string[]
  ): Promise<T[]> {
    let result = await this.dbContext.findAll({
      include,
      where: whereClause,
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    });
    return result;
  }
  async getOne(whereClause: any): Promise<T> {
    let result = await this.dbContext.findOne({
      where: whereClause,
    });
    return result;
  }
  async getOneWithAssociation(
    whereClause: any,
    include: string[],
    exclude: string[]
  ): Promise<T> {
    let result = await this.dbContext.findOne({
      include,
      where: whereClause,
      attributes: { exclude: exclude },
    });
    return result;
  }
  async create<S>(payload: S): Promise<T> {
    let result = await this.dbContext.create(payload);
    return result;
  }
}
