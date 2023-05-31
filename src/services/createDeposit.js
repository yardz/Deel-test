import { Op } from "sequelize";
import NP from "number-precision";

const MAX_PERCENTUAL = 0.24;

export const createDeposit = async (req, userId, value) => {
    if (!userId || typeof userId !== "number") {
        throw new Error("userId is required");
    }
    if (!value || typeof value !== "number" || value <= 0) {
        throw new Error("Value is not valid");
    }

    const sequelize = req.app.get("sequelize");
    let isDeposited;
    try {
        isDeposited = await sequelize.transaction(async (transaction) => {
            const { Profile, Job, Contract } = req.app.get("models");
            const profile = await Profile.findOne({
                where: { id: userId },
                transaction,
            });

            // Check Value limit
            const jobs = await Job.findAll({
                where: { paid: { [Op.not]: true } },
                include: {
                    model: Contract,
                    where: { ClientId: userId },
                },
                transaction,
            });

            const totalOpenBalance = jobs.reduce(
                (total, job) => NP.plus(total, job.price),
                0
            );
            if (value >= totalOpenBalance * MAX_PERCENTUAL) {
                throw new Error("Value is too high");
            }

            await profile.update(
                { balance: NP.plus(profile.balance, value) },
                { transaction }
            );
            return true;
        });
    } catch (error) {
        // Transaction has been rolled back
        throw new Error("Deposit cannot be created");
    }

    return isDeposited;
};
