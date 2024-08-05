import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  deletedAt: Date | null;
}

interface UserCreationAttributes
  extends Omit<UserAttributes, "id" | "deletedAt"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public address!: string;
  public deletedAt!: Date;

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
  },
  {
    sequelize,
    modelName: "User",
    tableName: "User",
    timestamps: true,
  }
);

export { User, UserAttributes, UserCreationAttributes };
