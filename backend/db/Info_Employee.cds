using Employee from './Employee';
using Id from './Employee';
        entity Info {
        key ifid : Id;
        emid : String(4);
        city : String(100);
        street : String(100);
        experience : Integer;
        age : Integer;
        };


        entity Task {
        key tsid : Id;
        emid : String(4);
        description : String(100);
        toEmployee : association to one Employee on toEmployee.emid = emid;
        };