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
      attributes: { exclude: ["updatedAt", "deletedAt"] },
    });
    return result;
  }
  async getOne(whereClause: any): Promise<T> {
    let result = await this.dbContext.findOne({
      where: whereClause,
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
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

  async update<S>(whereClause: any, payload: S): Promise<T> {
    let result = await this.dbContext.update(payload, {
      where: whereClause,
    });
    return result;
  }

  async count(whereClause: any): Promise<T> {
    const count = await this.dbContext.count({
      where: whereClause,
    });
    return count;
  }
}
