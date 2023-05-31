import NP from "number-precision";
import { getJob } from "./getJob";
import { getUserId } from "../utils/getUserId";

export const payJob = async (req, jobId) => {
    const sequelize = req.app.get("sequelize");
    let isPaid;
    try {
        isPaid = await sequelize.transaction(async (transaction) => {
            const { Profile } = req.app.get("models");
            const userId = getUserId(req);
            const job = await getJob(req, userId, jobId, transaction);

            if (!job) {
                throw new Error("job not found");
            }

            if (job.paid) {
                // Cannot pay for a job that has already been paid
                return false;
            }

            if (job.Contract.ClientId !== userId) {
                throw new Error("Only the Client can pay for a job");
            }

            // I get the profile information from here, because I need to update the balance
            // Incase on concurrent transactions, I need to make sure that the balance is updated
            const profile = await Profile.findOne({
                where: { id: userId },
                transaction,
            });

            if (!profile) {
                throw new Error("profile not found");
            }
            if (profile.balance < job.price) {
                throw new Error("Not enough balance");
            }

            await profile.update(
                { balance: NP.minus(profile.balance, job.price) },
                { transaction }
            );
            await job.update(
                { paid: true, paymentDate: new Date() },
                { transaction }
            );
            return true;
        });
    } catch (error) {
        // Transaction has been rolled back
        throw new Error("Job cannot be paid");
    }
    // Finish Transaction

    return isPaid;
};
