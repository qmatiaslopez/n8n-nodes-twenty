import { INodeProperties } from 'n8n-workflow';
import { PropertyBuilder } from '../builders';
import { OPERATION_DEFINITIONS, SEARCH_OPTIONS, RESOURCES } from '../constants';

const resource = RESOURCES.PERSON;
const operations = OPERATION_DEFINITIONS.PERSON;
const searchOptions = SEARCH_OPTIONS.PERSON;

export const personProperties: INodeProperties[] = [
	// Person operations
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

	// Company search method for listPersonsByCompany
	{
		displayName: 'Company Search By',
		name: 'companySearchBy',
		type: 'options',
		options: [
			{ name: 'Company Name', value: 'name' },
			{ name: 'Company UUID', value: 'uuid' },
		],
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['listByCompany'],
			},
		},
		default: 'name',
		description: 'How to identify the company',
	},

	// Company identifier (name or UUID)
	{
		displayName: 'Company Identifier',
		name: 'companyIdentifier',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['listByCompany'],
			},
		},
		default: '',
		placeholder: 'Company name or UUID',
		description: 'Company name or UUID depending on search method',
	},

	// Additional fields for person operations
	PropertyBuilder.createAdditionalFieldsProperty(resource, ['create', 'update'], [
		{
			displayName: 'First Name',
			name: 'firstName',
			type: 'string',
			default: '',
			description: 'First name of the person',
		},
		{
			displayName: 'Last Name',
			name: 'lastName',
			type: 'string',
			default: '',
			description: 'Last name of the person',
		},
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			placeholder: 'name@email.com',
			default: '',
			description: 'Primary email address',
		},
		{
			displayName: 'Phone Number',
			name: 'phone',
			type: 'string',
			default: '',
			description: 'Primary phone number',
		},
		{
			displayName: 'Phone Country Code',
			name: 'phoneCountryCode',
			type: 'string',
			default: '',
			placeholder: 'FR, US, ES, etc.',
			description: 'Phone country code (e.g., FR, US)',
		},
		{
			displayName: 'Phone Calling Code',
			name: 'phoneCallingCode',
			type: 'string',
			default: '',
			placeholder: '+33, +1, +34, etc.',
			description: 'Phone calling code (e.g., +33, +1)',
		},
		{
			displayName: 'Job Title',
			name: 'jobTitle',
			type: 'string',
			default: '',
			description: 'Job title or position',
		},
		{
			displayName: 'City',
			name: 'city',
			type: 'string',
			default: '',
			description: 'City where the person is located',
		},
		{
			displayName: 'Avatar URL',
			name: 'avatarUrl',
			type: 'string',
			default: '',
			description: 'URL of the person\'s avatar image',
		},
		{
			displayName: 'Company Name',
			name: 'companyName',
			type: 'string',
			default: '',
			description: 'Name of the company this person belongs to',
		},
		{
			displayName: 'LinkedIn URL',
			name: 'linkedinUrl',
			type: 'string',
			default: '',
			description: 'LinkedIn profile URL',
		},
		{
			displayName: 'Twitter/X URL',
			name: 'xUrl',
			type: 'string',
			default: '',
			description: 'Twitter/X profile URL',
		},
	]),

	// Custom field values for person updates
	PropertyBuilder.createCustomFieldsProperty(resource),
];