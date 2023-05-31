import { Op } from "sequelize";

export const getContract = async (req, userId, contractId, transaction) => {
    if (!contractId || typeof contractId !== "number") {
        throw new Error("ContractId is required");
    }
    const { Contract, Job } = req.app.get("models");
    return Contract.findOne({
        where: {
            id: contractId,
            [Op.or]: [{ ContractorId: userId }, { ClientId: userId }],
        },
        include: Job,
        transaction,
    });
};

export const getContractsByStatus = async (
    req,
    userId,
    status,
    transaction
) => {
    if (!userId || typeof userId !== "number") {
        throw new Error("userId is required");
    }
    if (!status || !Array.isArray(status)) {
        throw new Error("status is an array and is required");
    }

    const { Contract, Job } = req.app.get("models");

    return Contract.findAll({
        where: {
            status,
            [Op.or]: [{ ContractorId: userId }, { ClientId: userId }],
        },
        transaction,
        include: Job,
    });
};
