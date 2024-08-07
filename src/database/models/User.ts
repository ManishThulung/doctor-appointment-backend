import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";
import { Role } from "../../types/enums.types";

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  deletedAt: Date | null;
}

interface UserCreationAttributes
  extends Omit<UserAttributes, "id" | "deletedAt" | "role"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public deletedAt!: Date;
  public role!: Role;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
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
      type: DataTypes.ENUM(Role.Admin, Role.Doctor, Role.SuperAdmin, Role.User),
      defaultValue: Role.User,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "User",
    timestamps: true,
  }
);

export { User, UserAttributes, UserCreationAttributes };
