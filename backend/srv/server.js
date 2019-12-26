"use strict";

const https = require("https");
const port = process.env.PORT || 3000;
const server = require("http").createServer();
const xsenv = require("@sap/xsenv");
const xssec = require("@sap/xssec");
const xsHDBConn = require("@sap/hdbext");
const express = require("express");
const logging = require("@sap/logging");
const compression = require("compression");
const cds = require("@sap/cds");
const bodyParser = require('body-parser');

if (process.argv[2] === "--debug") {
    global.DEBUG_MODE = true;
    //Load environment variables for CLOUD
    xsenv.loadEnv();
}


https.globalAgent.options.ca = xsenv.loadCertificates();
global.__base = __dirname + "/";

// Initialize Express App
const app = express();

//Body parser
app.use(bodyParser.json());

//Compression
app.use(compression({
    threshold: "1b"
}));

//logging
const appContext = logging.createAppContext();
app.use(logging.middleware({
    appContext: appContext,
    logNetwork: false
}));


//HANA database
const hanaOptions = xsenv.getServices({
    hana: {
        plan: "hdi-shared"
    }
});
hanaOptions.hana.pooling = true;

app.use(
    xsHDBConn.middleware(hanaOptions.hana)
);

if (global.DEBUG_MODE) {
    hanaOptions.hana.ca = "-----BEGIN CERTIFICATE-----\nMIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBh\nMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3\nd3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD\nQTAeFw0wNjExMTAwMDAwMDBaFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVT\nMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j\nb20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG\n9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKPC3eQyaKl7hLOllsB\nCSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscFs3YnFo97\nnh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt\n43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7P\nT19sdl6gSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4\ngdW7jVg/tRvoSSiicNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAO\nBgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbR\nTLtm8KPiGxvDl7I90VUwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxvDl7I90VUw\nDQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1EnE9SsPTfrgT1eXkIoyQY/Esr\nhMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDiqw8cvpOp/2PV5Adg\n06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBAI+0tKIJF\nPnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0ls\nYSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQk\nCAUw7C29C79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=\n-----END CERTIFICATE-----\n";
}




//CDS OData V4 Handler
cds.connect({
    kind: "hana",
    logLevel: "info",
    credentials: hanaOptions.hana
});
cds
    .serve("gen/csn.json", {
        crashOnError: false
    })
    .at("/odata/")
    .with(require("./router/odata.js"))
    .in(app)
    .catch(err => {
        // do not crash on error
    });

//Setup Routes
require("./router")(app, server);

//Error handling
app.use(function (err, req, res, next) {
        res.status(500).send({
            "msgId": "",
            "type": "Error",
            "msg": err.message
        });
});

//Start the Server
server.on("request", app);
server.listen(port, () => console.info(`HTTP Server: ${server.address().port}`));
