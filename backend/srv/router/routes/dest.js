/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");
const cloudServices = require(global.__base + "utils/cloudServices");

module.exports = () => {
    const app = express.Router();

		//-----------------GET ALL DESTINATIONS---------------
    app.get("/", async (req, res, next) => {
        const logger = req.loggingContext.getLogger("/Application");

        try {
            logger.info('Getting onPremise systems');
            let aOnPremiseSystems = await cloudServices.getOnPremiseSystems();
            logger.info('onPremise systems received');

            //data contains secure information. So we filter it
            aOnPremiseSystems = aOnPremiseSystems
                .map(system => (({Name, Description}) => ({Name, Description}))(system));

            res.type("application/json").status(200).send(JSON.stringify(aOnPremiseSystems));
        } catch (e) {
            next(e);
        }
    });


		//-----------------GET DESTINATION BY NAME---------------
    app.get("/:syid", async (req, res, next) => {
        const logger = req.loggingContext.getLogger("/Application");

        try {
            const syid = req.params.syid;

            logger.info('Getting onPremise system');
            let oOnPremiseSystem = await cloudServices.getOnPremiseSystemById(syid);
            logger.info('onPremise system received');

/*          Filter by property 
            if (!oOnPremiseSystem.destinationConfiguration.usage
                || oOnPremiseSystem.destinationConfiguration.usage.indexOf("pt_system") === -1) {
                    throw new PTError.API_SystemIsNotForPT([syid]);
            }
*/
            oOnPremiseSystem = {
                Name: oOnPremiseSystem.destinationConfiguration.Name,
                Description: oOnPremiseSystem.destinationConfiguration.Description
            };

            res.type("application/json").status(200).send(JSON.stringify(oOnPremiseSystem));
        } catch (e) {
            next(e);
        }
    });

		//-----------------GET DATA FROM On-Premise System---------------
    app.get("/data/:syid", async (req, res, next) => {
        try {
	  			const logger = req.loggingContext.getLogger("/Application");

    			logger.info('Getting onPremise system');
    			const oOnPremiseSystem = await cloudServices.getOnPremiseSystemById(syid);
    			logger.info('onPremise system received');

		    	const oData = await cloudServices.getOnPremiseSystemData(oOnPremiseSystem, "en");
        	res.type("application/json").status(200).send(JSON.stringify(oData));
        } catch (e) {
            next(e);
        }
		});


    return app;
};
