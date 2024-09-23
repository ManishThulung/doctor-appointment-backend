import { DataTypes, Model, UUIDV4 } from "sequelize";
import { AppointmentStatus } from "../../types/enums.types";
import sequelize from "../index";
import { Doctor } from "./Doctor";
import { User } from "./User";
import { Hospital } from "./Hospital";

interface AppointmentAttributes {
  id: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  canceledAt: Date | null;
  approvedAt: Date | null;
  deletedAt: Date | null;
  DoctorId?: string;
  UserId?: string;
  HospitalId?: string;
}

interface AppointmentCreationAttributes
  extends Omit<
    AppointmentAttributes,
    "id" | "deletedAt" | "approvedAt" | "canceledAt" | "status"
  > {}

class Appointment
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes
{
  public id!: string;
  public date!: string;
  public timeSlot!: string;
  public status!: AppointmentStatus;
  public canceledAt!: Date;
  public approvedAt!: Date;
  public deletedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    timeSlot: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        AppointmentStatus.Pending,
        AppointmentStatus.Approved,
        AppointmentStatus.Completed
      ),
      defaultValue: AppointmentStatus.Pending,
      allowNull: false,
    },
    canceledAt: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
  },

  {
    sequelize,
    modelName: "Appointment",
    tableName: "Appointment",
    timestamps: true,
  }
);

Doctor.hasOne(Appointment);
Appointment.belongsTo(Doctor);
User.hasOne(Appointment);
Appointment.belongsTo(User);
Hospital.hasOne(Appointment);
Appointment.belongsTo(Hospital);

export { Appointment, AppointmentAttributes, AppointmentCreationAttributes };
