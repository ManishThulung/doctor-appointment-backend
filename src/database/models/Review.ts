import { DataTypes, Model, UUIDV4 } from "sequelize";
import sequelize from "../index";
import { Doctor } from "./Doctor";
import { User } from "./User";

interface ReviewAttributes {
  id: string;
  rating: string;
  review: string;
  deletedAt: Date | null;
  UserId?: string;
  ReviewId?: string;
  HospitalId?: string;
}

interface ReviewCreationAttributes
  extends Omit<ReviewAttributes, "id" | "deletedAt"> {}

class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  public id!: string;
  public rating!: string;
  public review!: string;
  public deletedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
  },

  {
    sequelize,
    modelName: "Review",
    tableName: "Review",
    timestamps: true,
  }
);

User.hasOne(Review);
Review.belongsTo(User);

Doctor.hasOne(Review);
Review.belongsTo(Doctor);

export { Review, ReviewAttributes, ReviewCreationAttributes };
