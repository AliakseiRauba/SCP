/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0, no-use-before-define:0 */
/*eslint-env node, es6 */
"use strict";

const HDBEXT = require("@sap/hdbext");

module.exports = class {

    static createConnection() {
        return new Promise((resolve, reject) => {
            const xsenv = require("@sap/xsenv");
            const options = xsenv.getServices({
                hana: {
                    plan: "hdi-shared"
                }
            });
            options.hana.pooling = true;
            HDBEXT.createConnection(options.hana, (error, client) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(client);
                }
            });
        });
    }

    constructor(client) {
        this.client = client;
        this.util = require("util");
        this.client.promisePrepare = this.util.promisify(this.client.prepare);
    }

    async getNextval(seqName) {
        try {
						const sSql = `SELECT "${seqName}".NEXTVAL AS "ID" FROM "DUMMY"`;
            const statement = await this.preparePromisified(sSql);
            const result = await this.statementExecPromisified(statement, []);

            if (result.length > 0) {
                return result[0].ID;
            }
        } catch (e) {
	        throw new Error("Internal error");
        }

        throw new Error("Internal error");
    }

    async executeUpdate(sSql, aValues) {
        try {
            const statement = await this.preparePromisified(sSql);
            return await this.statementExecPromisified(statement, aValues);
        } catch (e) {
            throw new Error("Error during executing sql: " + sSql + ". Error: " + JSON.stringify(e));
        }
    }

    preparePromisified(query) {
        return this.client.promisePrepare(query);
    }

    statementExecPromisified(statement, parameters) {
        statement.promiseExec = this.util.promisify(statement.exec);
        return statement.promiseExec(parameters);
    }

    loadProcedurePromisified(hdbext, schema, procedure) {
        hdbext.promiseLoadProcedure = this.util.promisify(hdbext.loadProcedure);
        return hdbext.promiseLoadProcedure(this.client, schema, procedure);
    }

    callProcedurePromisified(storedProc, inputParams) {
        return new Promise((resolve, reject) => {
            storedProc(inputParams, (error, outputScalar, ...results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length < 2) {
                        resolve({
                            outputScalar: outputScalar,
                            results: results[0]
                        });
                    } else {
                        const output = {
                            outputScalar: outputScalar
                        };
                        for (let i = 0; i < results.length; i++) {
                            output[`results${i}`] = results[i];
                        }
                        resolve(output);
                    }
                }
            });
        });
    }
};
