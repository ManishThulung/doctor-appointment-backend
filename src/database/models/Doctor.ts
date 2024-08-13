import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";
import { Address } from "./Address";
import { Department } from "./Department";
import { Hospital } from "./Hospital";

interface DoctorAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  dob: Date;
  gender: string;
  address: string;
  avatar: any;
  certificate: any;
  isVerified: boolean;
  isEmailVerified: boolean;
  deletedAt: Date | null;
  joinedAt: Date | null;
  DepartmentId?: string;
  HospitalId?: string;
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
  public phone!: string;
  public gender!: string;
  public address!: string;
  public dob!: Date;
  public avatar!: any;
  public certificate!: any;
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
    phone: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING(),
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
    certificate: {
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

Department.hasOne(Doctor);
Doctor.belongsTo(Department);

Hospital.hasOne(Doctor);
Doctor.belongsTo(Hospital);

export { Doctor, DoctorAttributes, DoctorCreationAttributes };
