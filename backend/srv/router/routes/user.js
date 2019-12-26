/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");

const dbClass = require(global.__base + "utils/dbClass");


function _prepareObject(oUser, req) {
		oUser.changedBy = "DebugUser";
    return oUser;
}


module.exports = () => {
    const app = express.Router();

    app.get("/", async (req, res, next) => {
        const logger = req.loggingContext.getLogger("/Application");
        logger.info('user get request');
        let tracer = req.loggingContext.getTracer(__filename);
        tracer.entering("/user", req, res);

        try {
            tracer.exiting("/user", "User Get works");
            res.type("application/json").status(201).send(JSON.stringify({text: "User Get works"}));
        } catch (e) {
            tracer.catching("/user", e);
            next(e);
        }
    });

    app.post("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);

            const oUser = _prepareObject(req.body, req);
				    oUser.usid = await db.getNextval("usid");

            const sSql = "INSERT INTO \"USER\" VALUES(?,?)";
						const aValues = [ oUser.usid, oUser.name ];

						console.log(aValues);
						console.log(sSql);
            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(201).send(JSON.stringify(oUser));
        } catch (e) {
            next(e);
        }
    });

    app.put("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);

            const oUser = _prepareObject(req.body, req);
            const sSql = "UPDATE \"USER\" SET \"NAME\" = ? WHERE \"USID\" = ?";
						const aValues = [ oUser.name, oUser.usid ];

            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(200).send(JSON.stringify(oUser));
        } catch (e) {
            next(e);
        }
    });

    return app;
};
