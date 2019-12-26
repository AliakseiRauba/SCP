using User from './User';
using Id from './User';

		entity Address {
		    key adid : Id;
		    usid : String(4);
		    city : String(100);
		    strt : String(100);
		    hnum : Integer;
		};

		entity Cars {
		    key crid : Id;
		    usid : String(4);
		    name : String(100);

    		toUser : association to one User on toUser.usid = usid;
		};
