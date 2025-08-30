import { SearchOption } from '../types';

export const SEARCH_OPTIONS = {
	PERSON: [
		{ name: 'Email', value: 'email' },
		{ name: 'Phone', value: 'phone' },
		{ name: 'Custom Field', value: 'customField' }
	],
	COMPANY: [
		{ name: 'Name', value: 'name' },
		{ name: 'Custom Field', value: 'customField' }
	],
	OPPORTUNITY: [
		{ name: 'Name', value: 'name' },
		{ name: 'Custom Field', value: 'customField' }
	]
} as const satisfies Record<string, readonly SearchOption[]>;