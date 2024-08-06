import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";
import { HospitalType } from "../../types/enums.types";

interface HospitalAttributes {
  id: string;
  name: string;
  type: HospitalType;
  // address: string;
  // country: string;
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
  public type!: HospitalType;
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
    type: {
      type: DataTypes.ENUM(HospitalType.Clinic, HospitalType.Hospital),
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
