using Employee as _Employee from '../db/Employee';
using Info as _Info from '../db/Info_Employee';
using Task as _Task from '../db/Info_Employee';

service odata {

  entity Employee @(
		title: 'Employees',
		Capabilities: {
			InsertRestrictions: {Insertable: false},
			UpdateRestrictions: {Updatable: false},
			DeleteRestrictions: {Deletable: false}
		}
	) as projection on _Employee;

  entity Info @(
		title: 'Information',
		Capabilities: {
			InsertRestrictions: {Insertable: false},
			UpdateRestrictions: {Updatable: false},
			DeleteRestrictions: {Deletable: false}
		}
	) as projection on _Info;

    entity Task @(
		title: 'Tasks',
		Capabilities: {
			InsertRestrictions: {Insertable: false},
			UpdateRestrictions: {Updatable: false},
			DeleteRestrictions: {Deletable: false}
		}
	) as projection on _Task;

}
