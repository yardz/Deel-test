import bodyParser from "body-parser";
import express from "express";
import { getProfile } from "./middleware/getProfile";
import { sequelize } from "./model";
import { getContract, getContractsByStatus } from "./services/getContract";
import { getJobsUnpaid } from "./services/getJob";
import { payJob } from "./services/payJob";
import { getUserId } from "./utils/getUserId";
import { createDeposit } from "./services/createDeposit";
import * as mappers from "./utils/responses";
import { getProfessionsRank } from "./services/getProfessionsRank";
import { getClientsRank } from "./services/getClientsRank";

const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

/*
 * Returns user profile
 */
app.get("/profile", getProfile, async (req, res) => {
    res.json(req.profile);
});

/*
 * Returns all contracts that are in the "new" or "in_progress" state.
 */
app.get("/contracts", getProfile, async (req, res) => {
    const userId = getUserId(req);
    const contracts = await getContractsByStatus(req, userId, [
        "new",
        "in_progress",
    ]);
    if (!contracts) return res.status(404).end();
    res.json(contracts.map(mappers.mapContractResponse));
});

/*
 * Returns contract by id
 */
app.get("/contracts/:id", getProfile, async (req, res) => {
    const { id } = req.params;
    const userId = getUserId(req);
    const contract = await getContract(req, userId, parseInt(id));
    if (!contract) return res.status(404).end();
    // res.json(mappers.mapContractResponse(contract));
    res.json(contract);
});

/*
 * Returns all unpaid jobs for the current user
 */
app.get("/jobs/unpaid", getProfile, async (req, res) => {
    const userId = getUserId(req);
    const jobs = await getJobsUnpaid(req, userId);
    if (!jobs || jobs.length === 0) return res.status(404).end();
    res.json(jobs.map(mappers.mapJobResponse));
});

app.post("/jobs/:id/pay", getProfile, async (req, res) => {
    const { id } = req.params;
    let paid;
    try {
        paid = await payJob(req, parseInt(id));
    } catch (error) {
        return res.status(404).end();
    }
    if (!paid) return res.status(405).end();
    res.status(204).end();
});

app.post("/balances/deposit/:userId", async (req, res) => {
    const { userId } = req.params;
    const { amount } = req.body;
    let deposit;
    try {
        deposit = await createDeposit(req, parseInt(userId), amount);
    } catch (error) {
        // i can log the error here
        return res.status(405).end();
    }

    if (!deposit) return res.status(405).end();
    res.status(204).end();
});

app.get("/admin/best-profession", async (req, res) => {
    let { start, end } = req.query;
    if (!start || !end) return res.status(400).end();
    start = new Date(start);
    end = new Date(end);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).end();
    }

    const ranking = await getProfessionsRank(req, start, end);
    return res.json(ranking);
});

app.get("/admin/best-clients", async (req, res) => {
    let { start, end, limit } = req.query;
    if (limit) {
        limit = parseInt(limit);
    } else {
        limit = 2;
    }
    if (!start || !end) return res.status(400).end();
    start = new Date(start);
    end = new Date(end);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).end();
    }

    const ranking = await getClientsRank(req, start, end, limit);
    return res.json(ranking.map(mappers.mapClientRankResponse));
});

export default app;
