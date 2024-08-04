import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";

interface HospitalAttributes {
  id: string;
  name: string;
  address: string;
  country: string;
  deletedAt: Date | null;
}

interface HospitalCreationAttributes
  extends Omit<HospitalAttributes, "id" | "deletedAt"> {}

class Hospital
  extends Model<HospitalAttributes, HospitalCreationAttributes>
  implements HospitalAttributes
{
  public id!: string;
  public name!: string;
  public country!: string;
  public address!: string;
  public deletedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Hospital.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Hospital",
    tableName: "Hospital",
    timestamps: true,
  }
);

export { Hospital, HospitalAttributes, HospitalCreationAttributes };
