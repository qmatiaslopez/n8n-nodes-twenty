import { INodeProperties } from 'n8n-workflow';
import { PropertyBuilder } from '../builders';
import { OPERATION_DEFINITIONS, SEARCH_OPTIONS, RESOURCES } from '../constants';

const resource = RESOURCES.OPPORTUNITY;
const operations = OPERATION_DEFINITIONS.OPPORTUNITY;
const searchOptions = SEARCH_OPTIONS.OPPORTUNITY;

export const opportunityProperties: INodeProperties[] = [
	// Opportunity operations
	PropertyBuilder.createOperationProperty(resource, operations),

	// Search configuration for find operations
	PropertyBuilder.createSearchByProperty(resource, searchOptions, 'find'),
	PropertyBuilder.createCustomFieldPathProperty([resource], 'find'),
	PropertyBuilder.createSearchValueProperty([resource], 'find'),

	// Search configuration for update/delete operations
	PropertyBuilder.createSearchByProperty(resource, searchOptions, 'update'),
	PropertyBuilder.createSearchByProperty(resource, searchOptions, 'delete'),
	PropertyBuilder.createCustomFieldPathProperty([resource], 'update'),
	PropertyBuilder.createCustomFieldPathProperty([resource], 'delete'),
	PropertyBuilder.createSearchValueProperty([resource], 'update'),
	PropertyBuilder.createSearchValueProperty([resource], 'delete'),

	// Opportunity name for create operations
	PropertyBuilder.createStringProperty(
		'Opportunity Name',
		'opportunityName',
		resource,
		['create'],
		{
			required: true,
			description: 'Name of the opportunity to create'
		}
	),

	// Additional fields for opportunity operations
	PropertyBuilder.createAdditionalFieldsProperty(resource, ['create', 'update'], [
		{
			displayName: 'Opportunity Name',
			name: 'name',
			type: 'string',
			default: '',
			description: 'Name of the opportunity',
		},
		{
			displayName: 'Amount',
			name: 'amount',
			type: 'number',
			default: 0,
			description: 'Opportunity amount in micros (e.g., 1000000 = $1)',
		},
		{
			displayName: 'Currency Code',
			name: 'currencyCode',
			type: 'string',
			default: 'USD',
			placeholder: 'USD, EUR, GBP, etc.',
			description: 'Currency code for the amount',
		},
		{
			displayName: 'Close Date',
			name: 'closeDate',
			type: 'dateTime',
			default: '',
			description: 'Expected closing date of the opportunity',
		},
		{
			displayName: 'Stage',
			name: 'stage',
			type: 'options',
			options: [
				{ name: 'Customer', value: 'CUSTOMER' },
				{ name: 'Meeting', value: 'MEETING' },
				{ name: 'New', value: 'NEW' },
				{ name: 'Proposal', value: 'PROPOSAL' },
				{ name: 'Screening', value: 'SCREENING' },
			],
			default: 'NEW',
			description: 'Current stage of the opportunity',
		},
		{
			displayName: 'Company Name',
			name: 'companyName',
			type: 'string',
			default: '',
			description: 'Name of the company this opportunity belongs to',
		},
		{
			displayName: 'Point of Contact Email',
			name: 'pointOfContactEmail',
			type: 'string',
			default: '',
			placeholder: 'contact@company.com',
			description: 'Email of the person who is the point of contact',
		},
	]),

	// Filters for list opportunities
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['list'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Stage',
				name: 'stage',
				type: 'options',
				options: [
					{ name: 'Customer', value: 'CUSTOMER' },
					{ name: 'Meeting', value: 'MEETING' },
					{ name: 'New', value: 'NEW' },
					{ name: 'Proposal', value: 'PROPOSAL' },
					{ name: 'Screening', value: 'SCREENING' },
				],
				default: 'NEW',
				description: 'Filter opportunities by stage',
			},
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				default: '',
				description: 'Filter opportunities by company ID',
			},
			{
				displayName: 'Point of Contact ID',
				name: 'pointOfContactId',
				type: 'string',
				default: '',
				description: 'Filter opportunities by point of contact ID',
			},
			{
				displayName: 'Search Term',
				name: 'searchTerm',
				type: 'string',
				default: '',
				placeholder: 'Search in opportunity names',
				description: 'Search term to filter opportunities by name',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Order By',
				name: 'orderBy',
				type: 'options',
				options: [
					{ name: 'Close Date (Latest)', value: 'closeDate:DESC' },
					{ name: 'Close Date (Soonest)', value: 'closeDate:ASC' },
					{ name: 'Created Date (Newest)', value: 'createdAt:DESC' },
					{ name: 'Created Date (Oldest)', value: 'createdAt:ASC' },
					{ name: 'Name (A-Z)', value: 'name:ASC' },
					{ name: 'Name (Z-A)', value: 'name:DESC' },
				],
				default: 'createdAt:DESC',
				description: 'How to sort the results',
			},
		],
	},
];