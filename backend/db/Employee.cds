type Id : String(4);
using Task from './Info_Employee';
using Info from './Info_Employee';
entity Employee {
        key emid : Id;
        name : String(100);
        toTask : association to many Task on toTask.emid = emid;
        toInfo : association to one Info on toInfo.emid = emid;
};