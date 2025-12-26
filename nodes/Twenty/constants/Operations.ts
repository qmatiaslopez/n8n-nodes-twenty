export const RESOURCES = {
	PERSON: 'person',
	COMPANY: 'company', 
	OPPORTUNITY: 'opportunity',
	NOTE: 'note',
	TASK: 'task'
} as const;

export const OPERATIONS = {
	CREATE: 'create',
	FIND: 'find',
	UPDATE: 'update',
	DELETE: 'delete',
	LIST: 'list',
	LIST_BY_COMPANY: 'listByCompany'
} as const;

export const OPERATION_DEFINITIONS = {
	PERSON: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new person',
			action: 'Create a person'
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete a person',
			action: 'Delete a person'
		},
		{
			name: 'Find',
			value: 'find',
			description: 'Search for a person using various criteria',
			action: 'Find a person'
		},
		{
			name: 'List by Company',
			value: 'listByCompany',
			description: 'List all people associated with a company',
			action: 'List people by company'
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update an existing person',
			action: 'Update a person'
		}
	],
	COMPANY: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new company',
			action: 'Create a company'
		},
		{
			name: 'Find',
			value: 'find',
			description: 'Search for a company using various criteria',
			action: 'Find a company'
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update an existing company',
			action: 'Update a company'
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete a company',
			action: 'Delete a company'
		}
	],
	OPPORTUNITY: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new opportunity',
			action: 'Create an opportunity'
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete an opportunity',
			action: 'Delete an opportunity'
		},
		{
			name: 'Find',
			value: 'find',
			description: 'Search for an opportunity using various criteria',
			action: 'Find an opportunity'
		},
		{
			name: 'List',
			value: 'list',
			description: 'List opportunities with optional filters',
			action: 'List opportunities'
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update an existing opportunity',
			action: 'Update an opportunity'
		}
	],
	NOTE: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new note and assign it to people or companies',
			action: 'Create a note'
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update an existing note',
			action: 'Update a note'
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete a note',
			action: 'Delete a note'
		},
		{
			name: 'List',
			value: 'list',
			description: 'List notes assigned to a person or company',
			action: 'List notes'
		}
	],
	TASK: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new task',
			action: 'Create a task'
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete a task',
			action: 'Delete a task'
		},
		{
			name: 'Find',
			value: 'find',
			description: 'Search for a task using various criteria',
			action: 'Find a task'
		},
		{
			name: 'List',
			value: 'list',
			description: 'List tasks with optional filters',
			action: 'List tasks'
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update an existing task',
			action: 'Update a task'
		}
	]
} as const;