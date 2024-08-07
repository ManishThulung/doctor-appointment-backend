import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";
import { Address } from "./Address";

interface DoctorAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  dob: Date;
  avatar: any;
  certificates: any;
  specialization: string[];
  isVerified: boolean;
  isEmailVerified: boolean;
  deletedAt: Date | null;
  joinedAt: Date | null;
  AddressId?: string;
}

interface DoctorCreationAttributes
  extends Omit<
    DoctorAttributes,
    "id" | "deletedAt" | "joinedAt" | "isVerified" | "isEmailVerified"
  > {}

class Doctor
  extends Model<DoctorAttributes, DoctorCreationAttributes>
  implements DoctorAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public dob!: Date;
  public avatar!: any;
  public certificates!: any;
  public specialization!: string[];
  public isVerified!: boolean;
  public isEmailVerified!: boolean;
  public deletedAt!: Date;
  public joinedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Doctor.init(
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
    specialization: {
      type: DataTypes.JSON(),
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATEONLY(),
      allowNull: false,
    },
    avatar: {
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
    certificates: {
      type: DataTypes.JSON(),
      allowNull: false,
    },
  },

  {
    sequelize,
    modelName: "Doctor",
    tableName: "Doctor",
    timestamps: true,
  }
);

Address.hasOne(Doctor);
Doctor.belongsTo(Address);

export { Doctor, DoctorAttributes, DoctorCreationAttributes };
