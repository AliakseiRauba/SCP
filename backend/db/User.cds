type Id : String(4);
using Cars from './ExtraInfo';
using Address from './ExtraInfo';

entity User {
    key usid : Id;
    name : String(100);

    toCars : association to many Cars on toCars.usid = usid;
    toAddress : association to one Address on toAddress.usid = usid;
};
