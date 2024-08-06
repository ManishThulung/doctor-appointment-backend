import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";
import { HospitalType } from "../../types/enums.types";
import { Address } from "./Address";

interface HospitalAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  type: HospitalType;
  logo: any;
  gallery: any;
  specialization: string[];
  isVerified: boolean;
  isEmailVerified: boolean;
  deletedAt: Date | null;
  joinedAt: Date | null;
  AddressId?: string;
}

interface HospitalCreationAttributes
  extends Omit<
    HospitalAttributes,
    "id" | "deletedAt" | "joinedAt" | "isVerified" | "isEmailVerified"
  > {}

class Hospital
  extends Model<HospitalAttributes, HospitalCreationAttributes>
  implements HospitalAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public type!: HospitalType;
  public specialization!: string[];
  public logo!: any;
  public gallery!: any;
  public isVerified!: boolean;
  public isEmailVerified!: boolean;
  public deletedAt!: Date;
  public joinedAt!: Date;
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(HospitalType.Clinic, HospitalType.Hospital),
      allowNull: false,
    },
    specialization: {
      type: DataTypes.JSON(),
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
      allowNull: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
      allowNull: false,
    },
    joinedAt: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
    logo: {
      type: DataTypes.JSONB(),
      allowNull: false,
    },
    gallery: {
      type: DataTypes.JSON(),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Hospital",
    tableName: "Hospital",
    timestamps: true,
  }
);

Address.hasOne(Hospital);
Hospital.belongsTo(Address);

export { Hospital, HospitalAttributes, HospitalCreationAttributes };
