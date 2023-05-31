import { Op } from "sequelize";

export const getJobs = async (req, userId, transaction) => {
    const { Job, Contract } = req.app.get("models");
    return Job.findAll({
        include: {
            model: Contract,
            where: {
                [Op.or]: [{ ContractorId: userId }, { ClientId: userId }],
            },
        },
        transaction,
    });
};

export const getJob = async (req, userId, jobId, transaction) => {
    if (!userId || typeof userId !== "number") {
        throw new Error("userId is required");
    }
    if (!jobId || typeof jobId !== "number") {
        throw new Error("jobId is required");
    }
    const { Job, Contract } = req.app.get("models");
    return Job.findOne({
        where: { id: jobId },
        include: {
            model: Contract,
            where: {
                [Op.or]: [{ ContractorId: userId }, { ClientId: userId }],
            },
        },
        transaction,
    });
};

export const getJobsUnpaid = async (req, userId, transaction) => {
    const jobs = await getJobs(req, userId, transaction);
    return jobs.filter((job) => job.paid !== true);
};
