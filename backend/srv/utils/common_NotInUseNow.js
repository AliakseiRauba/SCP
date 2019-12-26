/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0, no-use-before-define:0 */
/*eslint-env node, es6 */
"use strict";

const PTError = require(global.__base + "utils/PTError");
const ENTITY = require(global.__base + "utils/entity");


//HERE we export some methods
module.exports = {
    getInnerProperty: getInnerProperty,
    getEntityByLabel: getEntityByLabel,

    checkAjaxAuth: checkAjaxAuth,
    getAjaxUser: getAjaxUser,
    getAjaxCompany: getAjaxCompany,
    getAjaxLang: getAjaxLang,

    checkOdataAuth: checkOdataAuth,
    getOdataUser: getOdataUser,
    getOdataCompany: getOdataCompany,
    getOdataLang: getOdataLang
};






//HERE we implement all methods




/**
 * @param req
 * @param scope
 * @throws CMN_Forbidden
 */
function checkAjaxAuth(req, scope) {
    if (scope === null || process.argv[2] === "--debug") {
        return;
    }

    if (!req.authInfo.checkScope(`${req.authInfo.xsappname}.${scope}`)) {
        throw new PTError.CMN_Forbidden([getAjaxUser(req), `${req.authInfo.xsappname}.${scope}`]);
    }
}

/**
 * @param req
 * @param scope
 * @throws CMN_Forbidden
 */
function checkOdataAuth(req, scope) {
    if (scope === null || process.argv[2] === "--debug") {
        return;
    }

    if (!req.attr.checkScope(`${req.attr.xsappname}.${scope}`)) {
        throw new PTError.CMN_Forbidden([getOdataUser(req), `${req.authInfo.xsappname}.${scope}`]);
    }
}


/**
 * @param req
 * @throws CMN_UserNotDefined
 */
function getOdataUser(req) {
    if (process.argv[2] === "--debug") {
        return "debugUser";
    }

    const fio = getInnerProperty(["user", "name", "familyName"], req, '') +
        " " + getInnerProperty(["user", "name", "givenName"], req, '');
    const email = getInnerProperty(["user", "emails", 0, "value"], req, undefined);

    const user = fio !== " " ? fio : email;
    if (!user) {
        throw new PTError.CMN_UserNotDefined([]);
    }
    return user;
}

/**
 * @param req
 * @throws CMN_UserNotDefined
 */
function getAjaxUser(req) {
    if (process.argv[2] === "--debug") {
        return "debugUser";
    }

    const fio = getInnerProperty(["authInfo", "userInfo", "familyName"], req, '') +
        " " + getInnerProperty(["authInfo", "userInfo", "givenName"], req, '');
    const email = getInnerProperty(["authInfo", "userInfo", "email"], req, undefined);

    const user = fio !== " " ? fio : email;
    if (!user) {
        throw new PTError.CMN_UserNotDefined([]);
    }
    return user;
}

/**
 * @param req
 * @throws CMN_CompanyNotDefined, CMN_BadCompanyProvided
 */
function getOdataCompany(req) {
    const aCompany = getInnerProperty(["attr", "userAttributes", "company"], req, undefined);
    return _getCompany(aCompany);
}

/**
 * @param req
 * @throws CMN_CompanyNotDefined, CMN_BadCompanyProvided
 */
function getAjaxCompany(req) {
    const aCompany = getInnerProperty(["authInfo", "userAttributes", "company"], req, undefined);
    return _getCompany(aCompany);
}

/**
 * @param req
 */
function getOdataLang(req) {
    if (process.argv[2] === "--debug") {
        return "en";
    }

    const lang = getInnerProperty(["user", "locale"], req, 'en');
    return lang.toLowerCase();
}

/**
 * @param req
 */
function getAjaxLang(req) {
    if (process.argv[2] === "--debug") {
        return "en";
    }

    const langparser = require("accept-language-parser");
    const lang = req.headers["accept-language"];
    if (!lang) {
        return "en";
    }
    const arr = langparser.parse(lang);
    if (!arr || arr.length < 1) {
        return "en";
    }
    return arr[0].code;
}

/**
 * @param sLabel
 * @returns {oEntity}
 * @throws CMN_UnknownEntity
 */
function getEntityByLabel(sLabel) {
    const oEntity = ENTITY[sLabel];
    if (!oEntity) {
        throw new PTError.CMN_UnknownEntity([sLabel]);
    }
    return oEntity;
}

/**
 * @param props
 * @param obj
 * @param nul
 */
function getInnerProperty(props, obj, nul) {
    return props.reduce((xs, x) => (xs && xs[x]) ? xs[x] : nul, obj);
}

/**
 * @param aCompany
 * @returns {sCompany}
 * @throws CMN_CompanyNotDefined, CMN_BadCompanyProvided
 * @private
 */
function _getCompany(aCompany) {
    if (process.argv[2] === "--debug") {
        return "LeverX";
    }

    if (!aCompany) {
        throw new PTError.CMN_CompanyNotDefined([]);
    }
    if (aCompany.length !== 1) {
        throw new PTError.CMN_BadCompanyProvided([]);
    }
    return aCompany[0];
}
