import { INodeProperties } from 'n8n-workflow';
import { PropertyBuilder } from '../builders';
import { OPERATION_DEFINITIONS, SEARCH_OPTIONS, RESOURCES } from '../constants';

const resource = RESOURCES.COMPANY;
const operations = OPERATION_DEFINITIONS.COMPANY;
const searchOptions = SEARCH_OPTIONS.COMPANY;

export const companyProperties: INodeProperties[] = [
	// Company operations
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

	// Company name for create operations
	PropertyBuilder.createStringProperty(
		'Company Name',
		'companyName',
		resource,
		['create'],
		{
			required: true,
			description: 'Name of the company to create'
		}
	),

	// Additional fields for company operations
	PropertyBuilder.createAdditionalFieldsProperty(resource, ['create', 'update'], [
		{
			displayName: 'Company Name',
			name: 'name',
			type: 'string',
			default: '',
			description: 'Name of the company',
		},
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			default: '',
			description: 'Company website domain',
		},
		{
			displayName: 'Employees',
			name: 'employees',
			type: 'number',
			default: 0,
			description: 'Number of employees in the company',
		},
		{
			displayName: 'Annual Recurring Revenue (Micros)',
			name: 'annualRecurringRevenueMicros',
			type: 'number',
			default: 0,
			description: 'Annual Recurring Revenue in micros (e.g., 1000000 = $1)',
		},
		{
			displayName: 'Currency Code',
			name: 'currencyCode',
			type: 'string',
			default: 'USD',
			placeholder: 'USD, EUR, GBP, etc.',
			description: 'Currency code for revenue (USD, EUR, etc.)',
		},
		{
			displayName: 'Company LinkedIn URL',
			name: 'companyLinkedinUrl',
			type: 'string',
			default: '',
			description: 'Company LinkedIn page URL',
		},
		{
			displayName: 'Company Twitter/X URL',
			name: 'companyXUrl',
			type: 'string',
			default: '',
			description: 'Company Twitter/X account URL',
		},
		// Address fields
		{
			displayName: 'Address Street 1',
			name: 'addressStreet1',
			type: 'string',
			default: '',
			description: 'First line of company address',
		},
		{
			displayName: 'Address Street 2',
			name: 'addressStreet2',
			type: 'string',
			default: '',
			description: 'Second line of company address',
		},
		{
			displayName: 'Address City',
			name: 'addressCity',
			type: 'string',
			default: '',
			description: 'Company address city',
		},
		{
			displayName: 'Address Postcode',
			name: 'addressPostcode',
			type: 'string',
			default: '',
			description: 'Company address postal code',
		},
		{
			displayName: 'Address State',
			name: 'addressState',
			type: 'string',
			default: '',
			description: 'Company address state/province',
		},
		{
			displayName: 'Address Country',
			name: 'addressCountry',
			type: 'string',
			default: '',
			description: 'Company address country',
		},
		{
			displayName: 'Account Owner Email',
			name: 'accountOwnerEmail',
			type: 'string',
			default: '',
			placeholder: 'owner@company.com',
			description: 'Email of the account owner to assign to this company',
		},
	]),

	// Custom field values for company updates
	PropertyBuilder.createCustomFieldsProperty(resource),
];