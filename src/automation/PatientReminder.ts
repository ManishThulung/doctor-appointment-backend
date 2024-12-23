import cron from "node-cron";
import { Appointment } from "../database/models/Appointment";
import { Hospital } from "../database/models/Hospital";
import { AppointmentService } from "../services/AppointmentService";
import { EmailService } from "../services/EmailService";
import { AppointmentStatus } from "../types/enums.types";

export class PatientReminder {
  private appointment: AppointmentService<Appointment>;
  private email: EmailService<Hospital>;

  constructor() {
    this.appointment = new AppointmentService({
      repository: Appointment,
    });
    this.email = new EmailService({ repository: Hospital });
  }

  public init() {
    console.log("Cron job for patient reminder has started.");
    cron.schedule("00 00 00 * * *", () => {
      this.findPatients();
      console.log("running every midnight - 12:00 am");
    });
  }

  private async findPatients(): Promise<void> {
    const appointments: any = await this.appointment.getAllWithAssociation(
      {
        deletedAt: null,
        status: AppointmentStatus.Approved,
      },
      ["Doctor", "User"]
    );
    if (!appointments) {
      console.log("No appointments found");
    }

    appointments.forEach((appointment) => {
      this.email.emailSender(
        appointment?.User?.email,
        "Appointment reminder!",
        `Dear, ${appointment?.User?.name} your appintment with the doctor ${appointment.Doctor.name} is today at ${appointment?.timeSlot}. Plase arrive at the hospital at the specified time.
        `
      );
    });
  }
}
