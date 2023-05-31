export const getProfessionsRank = async (req, start, end) => {
    const sequelize = req.app.get("sequelize");

    const paymentRank = await sequelize.query(`
    with ContractsPayment as (
        SELECT id, (
                        SELECT sum(Job.price)
                        FROM jobs AS Job
                        WHERE
                            Job.paid = true AND
                            Job.ContractId = Contract.id AND
                            Job.paymentDate BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
                        ) AS total
                    , (
                        SELECT profession
                        FROM profiles AS Contractor
                        WHERE
                            Contractor.id = Contract.ContractorId
                        ) AS profession
        FROM Contracts AS Contract
    )
    SELECT profession, sum(total) as totalPayments
      from ContractsPayment
      group by profession
      order by totalPayments DESC
    `);
    return paymentRank[0];
};
