/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0, no-use-before-define:0 */
/*eslint-env node, es6 */
"use strict";

const request = require('request-promise');
const xsenv = require("@sap/xsenv");

//begin----------GETTING CONFIGURATIONS-------------
const pt_uaa = xsenv.getServices({
    xsuaa: {
        tag: "xsuaa"
    }
}).xsuaa;

const pt_conn = xsenv.getServices({
    conn: {
        tag: "connectivity"
    }
}).conn;

const pt_dest = xsenv.getServices({
    dest: {
        tag: "destination"
    }
}).dest;

const sUaaUrl = pt_uaa.url;

const sConnProxy = `http://${pt_conn.onpremise_proxy_host}:${pt_conn.onpremise_proxy_port}`;
const sConnSecret = `${pt_conn.clientid}:${pt_conn.clientsecret}`;
const sConnCredentials = Buffer.from(sConnSecret).toString('base64');

const sDestUrl = pt_dest.url;
const sDestSecret = `${pt_dest.clientid}:${pt_dest.clientsecret}`;
const sDestCredentials = Buffer.from(sDestSecret).toString('base64');
//end----------GETTING CONFIGURATIONS-------------


//begin----------PREPARING REQUEST DATA TO GET AUTENTIFICATION TOKEN-------------
const _getUaaTokenOptions = (credentials, clientid) => {
    return {
        url: `${sUaaUrl}/oauth/token`,
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + credentials,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'client_id': clientid,
            'grant_type': 'client_credentials'
        }
    };
};
//end----------PREPARING REQUEST DATA TO GET AUTENTIFICATION TOKEN-------------

//begin----------SEND REQEST TO GET AUTENTIFICATION TOKEN-------------
const getUaaToken = async (sCredentials, clientId) => {
    const oAccessTokenOptions = _getUaaTokenOptions(sCredentials, clientId);
    return JSON.parse(await request(oAccessTokenOptions));
};
//end----------SEND REQEST TO GET AUTENTIFICATION TOKEN-------------


//begin----------GET LIST OF ON PREMISE SYSTEMS DEFINED IN CLOUD-------------
const getOnPremiseSystems = async () => {
    const sDestAccessToken = (await getUaaToken(sDestCredentials, pt_dest.clientid)).access_token;

    const oRequestOptions = {
        url: `${pt_dest.uri}/destination-configuration/v1/subaccountDestinations`,
        headers: {
            'Authorization': 'Bearer ' + sDestAccessToken
        }
    };

    return JSON.parse(await request(oRequestOptions));
};
//end----------GET LIST OF ON PREMISE SYSTEMS DEFINED IN CLOUD-------------


//begin----------GET ON PREMISE SYSTEMS DEFINED IN CLOUD BY ID-------------
const getOnPremiseSystemById = async systemId => {
    const sDestAccessToken = (await getUaaToken(sDestCredentials, pt_dest.clientid)).access_token;

    const oRequestOptions = {
        url: `${pt_dest.uri}/destination-configuration/v1/destinations/${systemId}`,
        headers: {
            'Authorization': 'Bearer ' + sDestAccessToken
        }
    };

    return JSON.parse(await request(oRequestOptions));
};
//end----------GET ON PREMISE SYSTEMS DEFINED IN CLOUD BY ID-------------


//begin----------GETTING DATA FROM ON PREMISE SYSTEM-------------
const getOnPremiseSystemData = async (onPremiseSystem, sLang) => {
    if(!onPremiseSystem.authTokens) {
        throw new Error("Error");
    }

    const sConnAccessToken = (await getUaaToken(sConnCredentials, pt_conn.clientid)).access_token;

    const sEndpoint = onPremiseSystem.destinationConfiguration.URL +
//-----------change code here to get another data
        "/sap/opu/odata/sap/MM_PUR_PO_MAINT_V2_SRV/C_MM_PaymentTermValueHelp" +
        "?sap-language=" + sLang.toLowerCase() +
        "&$format=json" +
        "&$select=PaymentTerms,PaymentTermsName,NetPaymentDays" +
        "&$orderby=PaymentTerms,NetPaymentDays";

    const oRequestOptions = {
        url: sEndpoint,
        method: 'GET',
        headers: {
            'Proxy-Authorization': 'Bearer ' + sConnAccessToken,
            'Authorization': `${onPremiseSystem.authTokens[0].type} ${onPremiseSystem.authTokens[0].value}`
        },
        proxy: sConnProxy
    };

    return JSON.parse(await request(oRequestOptions));
};


module.exports = {
    getUaaToken: getUaaToken,

    getOnPremiseSystems: getOnPremiseSystems,
    getOnPremiseSystemById: getOnPremiseSystemById,

    getOnPremiseSystemData: getOnPremiseSystemData
};
