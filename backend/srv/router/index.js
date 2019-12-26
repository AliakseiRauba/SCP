"use strict";

module.exports = (app, server) => {
    app.use("/user", require("./routes/user")());
    app.use("/dest", require("./routes/dest")());
};
