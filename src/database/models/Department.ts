import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";

interface DepartmentAttributes {
  id: string;
  name: string;
  description: string;
  image: any;
  deletedAt: Date | null;
}

interface DepartmentCreationAttributes
  extends Omit<DepartmentAttributes, "id" | "deletedAt"> {}

class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  public id!: string;
  public name!: string;
  public description!: string;
  public image!: string;
  public deletedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Department.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    image: {
      type: DataTypes.JSON(),
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
  },

  {
    sequelize,
    modelName: "Department",
    tableName: "Department",
    timestamps: true,
  }
);

export { Department, DepartmentAttributes, DepartmentCreationAttributes };
