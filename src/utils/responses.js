export const mapContractResponse = (contract) => {
    return {
        id: contract.id,
        terms: contract.terms,
        status: contract.status,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
        ContractorId: contract.ContractorId,
        ClientId: contract.ClientId,
    };
};

export const mapJobResponse = (job) => {
    return {
        id: job.id,
        description: job.description,
        price: job.price,
        paid: job.paid,
        paymentDate: job.paymentDate,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        ContractId: job.ContractId,
    };
};

export const mapClientRankResponse = (rankItem) => {
    return {
        id: rankItem.id,
        fullName: `${rankItem.firstName} ${rankItem.lastName}`,
        paid: rankItem.totalSpend,
    };
};
