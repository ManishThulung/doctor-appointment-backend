import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";
import { Role } from "../../types/enums.types";

interface PatientAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  role: Role;
  deletedAt: Date | null;
}

interface PatientCreationAttributes
  extends Omit<PatientAttributes, "id" | "deletedAt" | "role"> {}

class Patient
  extends Model<PatientAttributes, PatientCreationAttributes>
  implements PatientAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public address!: string;
  public deletedAt!: Date;
  public role!: Role;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
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
    address: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(Role.Admin, Role.Doctor, Role.SuperAdmin, Role.Patient),
      defaultValue: Role.Patient,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Patient",
    tableName: "Patient",
    timestamps: true,
  }
);

export { Patient, PatientAttributes, PatientCreationAttributes };
