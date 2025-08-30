import { INodeProperties } from 'n8n-workflow';

export const commonProperties: INodeProperties[] = [
	// Main resource selector
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Person',
				value: 'person',
				description: 'Work with people/contacts',
			},
			{
				name: 'Company',
				value: 'company',
				description: 'Work with companies/organizations',
			},
			{
				name: 'Opportunity',
				value: 'opportunity',
				description: 'Work with opportunities/deals',
			},
			{
				name: 'Note',
				value: 'note',
				description: 'Work with notes and comments',
			},
		],
		default: 'person',
	},


	// Advanced options
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Include Related Data',
				name: 'includeRelated',
				type: 'boolean',
				default: true,
				description: 'Whether to include related objects (company, people, etc.)',
			},
		],
	},
];