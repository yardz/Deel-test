export const getClientsRank = async (req, start, end, limit) => {
    const sequelize = req.app.get("sequelize");

    const profiles = await sequelize.query(`
        SELECT Profile.*, sum(Job.price) as totalSpend
        FROM Contracts AS Contract
        LEFT JOIN Jobs as Job on Contract.id = Job.ContractId
        LEFT JOIN Profiles as Profile on Profile.id = Contract.ClientId   
        WHERE
            Job.paid = true AND
            Job.paymentDate BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
        GROUP BY Profile.id
        ORDER BY totalSpend DESC
        LIMIT ${limit}
    `);

    return profiles[0];
};
