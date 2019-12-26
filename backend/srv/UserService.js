//MOCK service
module.exports = (srv) => {

    srv.on('READ', 'Users', () => [
        {
            usid: 'U001', name: "Batman",
            toCars: [
                {crid: "C001", usid: "U001", name: "BatMobile", toUser: {usid: 'U001', name: "Batman"}}
            ],
            toAddress: [
                { adid: "A001", usid: "U001", city: "Gotam", strt: "unknown" }
            ]
        }
    ]);

    srv.on('READ', 'Address', () => [
        { adid: "A001", usid: "U001", city: "Gotam", strt: "unknown" }
    ]);

    srv.on('READ', 'Cars', () => [
        {crid: "C001", usid: "U001", name: "BatMobile", toUser: {usid: 'U001', name: "Batman"}}
    ]);

};
