import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";

interface AddressAttributes {
  id: string;
  country: string;
  province: string;
  district: string;
  municipality: string;
  wardNo: number;
  wardName: string;
  toleNo: number | null;
  deletedAt: Date | null;
}

interface AddressCreationAttributes
  extends Omit<AddressAttributes, "id" | "deletedAt"> {}

class Address
  extends Model<AddressAttributes, AddressCreationAttributes>
  implements AddressAttributes
{
  public id!: string;
  public country!: string;
  public province!: string;
  public district: string;
  public municipality!: string;
  public wardName!: string;
  public wardNo!: number;
  public toleNo!: number;
  public deletedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Address.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },

    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    municipality: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    wardName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    wardNo: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    toleNo: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Address",
    tableName: "Address",
    timestamps: true,
  }
);

export { Address, AddressAttributes, AddressCreationAttributes };
