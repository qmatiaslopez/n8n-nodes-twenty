import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

// Import operations modules
import { PersonOperations } from './operations/PersonOperations';
import { CompanyOperations } from './operations/CompanyOperations';
import { OpportunityOperations } from './operations/OpportunityOperations';
import { NoteOperations } from './operations/NoteOperations';

export class Twenty implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twenty CRM',
		name: 'twenty',
		icon: 'file:twenty.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Twenty CRM using smart workflows',
		defaults: {
			name: 'Twenty',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'twentyApi',
				required: true,
			},
		],
		properties: [
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['person'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new person',
						action: 'Create a person',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a person',
						action: 'Delete a person',
					},
					{
						name: 'Find',
						value: 'find',
						description: 'Search for a person using various criteria',
						action: 'Find a person',
					},
					{
						name: 'List by Company',
						value: 'listByCompany',
						description: 'List all people associated with a company',
						action: 'List people by company',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing person',
						action: 'Update a person',
					},
				],
				default: 'find',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['company'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new company',
						action: 'Create a company',
					},
					{
						name: 'Find',
						value: 'find',
						description: 'Search for a company using various criteria',
						action: 'Find a company',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing company',
						action: 'Update a company',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a company',
						action: 'Delete a company',
					},
				],
				default: 'find',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['opportunity'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new opportunity',
						action: 'Create an opportunity',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an opportunity',
						action: 'Delete an opportunity',
					},
					{
						name: 'Find',
						value: 'find',
						description: 'Search for an opportunity using various criteria',
						action: 'Find an opportunity',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List opportunities with optional filters',
						action: 'List opportunities',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing opportunity',
						action: 'Update an opportunity',
					},
				],
				default: 'find',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['note'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new note and assign it to people or companies',
						action: 'Create a note',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing note',
						action: 'Update a note',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a note',
						action: 'Delete a note',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List notes assigned to a person or company',
						action: 'List notes',
					},
				],
				default: 'create',
			},
			{
				displayName: 'What Do You Want to Do?',
				name: 'useCase',
				type: 'options',
				displayOptions: {
					show: {
						'@version': [{ _cnd: { lte: 0 } }], // Hide this field
					},
				},
				options: [
					{
						name: 'Create Company',
						value: 'createCompany',
						description: 'Create a new company',
					},
					{
						name: 'Create Note',
						value: 'createNote',
						description: 'Create a new note and assign it to people or companies',
					},
					{
						name: 'Create Opportunity',
						value: 'createOpportunity',
						description: 'Create a new opportunity',
					},
					{
						name: 'Create Person',
						value: 'createPerson',
						description: 'Create a new person',
					},
					{
						name: 'Delete Company',
						value: 'deleteCompany',
						description: 'Delete a company',
					},
					{
						name: 'Delete Note',
						value: 'deleteNote',
						description: 'Delete a note',
					},
					{
						name: 'Delete Opportunity',
						value: 'deleteOpportunity',
						description: 'Delete an opportunity',
					},
					{
						name: 'Delete Person',
						value: 'deletePerson',
						description: 'Delete a person',
					},
					{
						name: 'Find Company',
						value: 'findCompany',
						description: 'Search for a company using various criteria',
					},
					{
						name: 'Find Opportunity',
						value: 'findOpportunity',
						description: 'Search for an opportunity using various criteria',
					},
					{
						name: 'Find Person',
						value: 'findPerson',
						description: 'Search for a person using various criteria',
					},
					{
						name: 'List Notes',
						value: 'listNotes',
						description: 'List notes assigned to a person or company',
					},
					{
						name: 'List Opportunities',
						value: 'listOpportunities',
						description: 'List opportunities with optional filters',
					},
					{
						name: 'List People by Company',
						value: 'listPersonsByCompany',
						description: 'List all people associated with a company',
					},
					{
						name: 'Update Company',
						value: 'updateCompany',
						description: 'Update an existing company',
					},
					{
						name: 'Update Note',
						value: 'updateNote',
						description: 'Update an existing note',
					},
					{
						name: 'Update Opportunity',
						value: 'updateOpportunity',
						description: 'Update an existing opportunity',
					},
					{
						name: 'Update Person',
						value: 'updatePerson',
						description: 'Update an existing person',
					},
				],
				default: 'findPerson',
			},

			// ===== NOTE FIELDS =====

			// Note title for create/update operations
			{
				displayName: 'Note Title',
				name: 'noteTitle',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['note'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Title of the note',
			},
			{
				displayName: 'Note Title',
				name: 'noteTitle',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['note'],
						operation: ['update'],
					},
				},
				default: '',
				description: 'New title for the note (leave empty to keep current)',
			},

			// Note body for create/update operations
			{
				displayName: 'Note Content',
				name: 'noteBody',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['note'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Content/body of the note',
			},
			{
				displayName: 'Note Content',
				name: 'noteBody',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						resource: ['note'],
						operation: ['update'],
					},
				},
				default: '',
				description: 'New content for the note (leave empty to keep current)',
			},

			// Note ID for update/delete operations
			{
				displayName: 'Note ID',
				name: 'noteId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['note'],
						operation: ['update', 'delete'],
					},
				},
				default: '',
				placeholder: 'e.g., 123e4567-e89b-12d3-a456-426614174000',
				description: 'UUID of the note to update or delete',
			},

			// Multiple targets for createNote
			{
				displayName: 'Assign To',
				name: 'noteTargets',
				type: 'fixedCollection',
				placeholder: 'Add Person or Company',
				displayOptions: {
					show: {
						resource: ['note'],
						operation: ['create'],
					},
				},
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'target',
						displayName: 'Target',
						values: [
							{
								displayName: 'Target Type',
								name: 'targetType',
								type: 'options',
								options: [
									{ name: 'Person', value: 'person' },
									{ name: 'Company', value: 'company' },
								],
								default: 'person',
								description: 'Whether to assign the note to a person or company',
							},
							{
								displayName: 'Person ID',
								name: 'personId',
								type: 'string',
								required: true,
								displayOptions: {
									show: {
										targetType: ['person'],
									},
								},
								default: '',
								placeholder: 'e.g., 123e4567-e89b-12d3-a456-426614174000',
								description: 'UUID of the person to assign the note to',
							},
							{
								displayName: 'Company ID',
								name: 'companyId',
								type: 'string',
								required: true,
								displayOptions: {
									show: {
										targetType: ['company'],
									},
								},
								default: '',
								placeholder: 'e.g., 987fcdeb-51a2-43d1-b123-426614174111',
								description: 'UUID of the company to assign the note to',
							},
						],
					},
				],
			},

			// List notes configuration
			{
				displayName: 'List Notes By',
				name: 'listNotesBy',
				type: 'options',
				options: [
					{ name: 'Person', value: 'person' },
					{ name: 'Company', value: 'company' },
				],
				displayOptions: {
					show: {
						resource: ['note'],
						operation: ['list'],
					},
				},
				default: 'person',
				description: 'Whether to list notes for a person or company',
			},

			// Person ID for listing notes
			{
				displayName: 'Person ID',
				name: 'personId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['note'],
						operation: ['list'],
						listNotesBy: ['person'],
					},
				},
				default: '',
				placeholder: 'e.g., 123e4567-e89b-12d3-a456-426614174000',
				description: 'UUID of the person to list notes for',
			},

			// Company ID for listing notes
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['note'],
						operation: ['list'],
						listNotesBy: ['company'],
					},
				},
				default: '',
				placeholder: 'e.g., 987fcdeb-51a2-43d1-b123-426614174111',
				description: 'UUID of the company to list notes for',
			},

			// Search configuration for unified search operations
			{
				displayName: 'Search By',
				name: 'searchBy',
				type: 'options',
				options: [
					{ name: 'Email', value: 'email' },
					{ name: 'Phone', value: 'phone' },
					{ name: 'Custom Field', value: 'customField' },
				],
				displayOptions: {
					show: {
						resource: ['person'],
						operation: ['find'],
					},
				},
				default: 'email',
				description: 'How to search for the person',
			},

			// Search configuration for company
			{
				displayName: 'Search By',
				name: 'searchBy',
				type: 'options',
				options: [
					{ name: 'Name', value: 'name' },
					{ name: 'Custom Field', value: 'customField' },
				],
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['find'],
					},
				},
				default: 'name',
				description: 'How to search for the company',
			},

			// Search configuration for opportunity
			{
				displayName: 'Search By',
				name: 'searchBy',
				type: 'options',
				options: [
					{ name: 'Name', value: 'name' },
					{ name: 'Custom Field', value: 'customField' },
				],
				displayOptions: {
					show: {
						resource: ['opportunity'],
						operation: ['find'],
					},
				},
				default: 'name',
				description: 'How to search for the opportunity',
			},


			// Custom Field Path for find operations
			{
				displayName: 'Field Path',
				name: 'customFieldPath',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						searchBy: ['customField'],
						resource: ['person', 'company', 'opportunity'],
						operation: ['find'],
					},
				},
				default: '',
				placeholder: 'linkedinLink.primaryLinkUrl or jobTitle',
				description: 'Field name or nested path (e.g., emails.primaryEmail, linkedinLink.primaryLinkUrl, jobTitle)',
			},

			// Search value (unified for all search operations)
			{
				displayName: 'Search Value',
				name: 'searchValue',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['person', 'company', 'opportunity'],
						operation: ['find'],
					},
				},
				default: '',
				placeholder: 'Value to search for',
				description: 'The value to search for in the selected field',
			},


			// Company name for createCompany
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name of the company to create',
			},

			// Opportunity name for createOpportunity
			{
				displayName: 'Opportunity Name',
				name: 'opportunityName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['opportunity'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name of the opportunity to create',
			},

			// Search configuration for delete/update person
			{
				displayName: 'Search By',
				name: 'updateSearchBy',
				type: 'options',
				options: [
					{ name: 'Email', value: 'email' },
					{ name: 'Phone', value: 'phone' },
					{ name: 'Custom Field', value: 'customField' },
				],
				displayOptions: {
					show: {
						resource: ['person'],
						operation: ['delete', 'update'],
					},
				},
				default: 'email',
				description: 'How to search for the person',
			},

			// Search configuration for delete/update company
			{
				displayName: 'Search By',
				name: 'updateSearchBy',
				type: 'options',
				options: [
					{ name: 'Name', value: 'name' },
					{ name: 'Custom Field', value: 'customField' },
				],
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['delete', 'update'],
					},
				},
				default: 'name',
				description: 'How to search for the company',
			},

			// Search configuration for delete/update opportunity
			{
				displayName: 'Search By',
				name: 'updateSearchBy',
				type: 'options',
				options: [
					{ name: 'Name', value: 'name' },
					{ name: 'Custom Field', value: 'customField' },
				],
				displayOptions: {
					show: {
						resource: ['opportunity'],
						operation: ['delete', 'update'],
					},
				},
				default: 'name',
				description: 'How to search for the opportunity',
			},


			// Custom Field Path for update/delete operations
			{
				displayName: 'Field Path',
				name: 'updateCustomFieldPath',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						updateSearchBy: ['customField'],
						resource: ['person', 'company', 'opportunity'],
						operation: ['delete', 'update'],
					},
				},
				default: '',
				placeholder: 'linkedinLink.primaryLinkUrl or jobTitle',
				description: 'Field name or nested path (e.g., emails.primaryEmail, linkedinLink.primaryLinkUrl, jobTitle)',
			},

			// Search value (for delete/update operations)
			{
				displayName: 'Search Value',
				name: 'updateSearchValue',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['person', 'company', 'opportunity'],
						operation: ['delete', 'update'],
					},
				},
				default: '',
				placeholder: 'Value to search for',
				description: 'The value to search for in the selected field',
			},

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
						resource: ['person'],
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
						resource: ['person'],
						operation: ['listByCompany'],
					},
				},
				default: '',
				placeholder: 'Company name or UUID',
				description: 'Company name or UUID depending on search method',
			},

			// Additional fields for person operations
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: ['person'],
						operation: ['create', 'update'],
					},
				},
				default: {},
				options: [
					// Person fields
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
				],
			},

			// Custom field values for person updates
			{
				displayName: 'Custom Field Values',
				name: 'customFields',
				type: 'fixedCollection',
				placeholder: 'Add Custom Field',
				displayOptions: {
					show: {
						resource: ['person'],
						operation: ['update'],
					},
				},
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'customField',
						displayName: 'Custom Field',
						values: [
							{
								displayName: 'Field Name',
								name: 'fieldName',
								type: 'string',
								default: '',
								placeholder: 'linkedinLink, xLink, instagramLink, etc.',
								description: 'Name of the custom field to update',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
								placeholder: 'https://linkedin.com/in/profile',
								description: 'New value for the custom field',
							},
						],
					},
				],
			},

			// Custom field values for company updates
			{
				displayName: 'Custom Field Values',
				name: 'customFields',
				type: 'fixedCollection',
				placeholder: 'Add Custom Field',
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['update'],
					},
				},
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'customField',
						displayName: 'Custom Field',
						values: [
							{
								displayName: 'Field Name',
								name: 'fieldName',
								type: 'string',
								default: '',
								placeholder: 'linkedinLink, xLink, instagramLink, etc.',
								description: 'Name of the custom field to update',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
								placeholder: 'https://linkedin.com/in/company',
								description: 'New value for the custom field',
							},
						],
					},
				],
			},

			// Additional fields for company operations
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['create', 'update'],
					},
				},
				default: {},
				options: [
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
				],
			},

			// Additional fields for opportunity operations
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: ['opportunity'],
						operation: ['create', 'update'],
					},
				},
				default: {},
				options: [
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
				],
			},

			// Filters for list opportunities
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				displayOptions: {
					show: {
						resource: ['opportunity'],
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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				// Get resource and operation from new categorized structure
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				
				// For backward compatibility, also get useCase if present
				let useCase: string | undefined;
				try {
					useCase = this.getNodeParameter('useCase', i) as string;
				} catch {
					// useCase doesn't exist in new workflows, which is expected
				}

				let responseData: any;

				// Use new resource+operation logic if available, fall back to useCase for compatibility
				if (resource && operation) {
					// New categorized structure
					const resourceOperation = `${resource}:${operation}`;
					switch (resourceOperation) {
					// NOTE OPERATIONS
					case 'note:create':
						responseData = await NoteOperations.createNote(this, i);
						break;

					case 'note:list':
						responseData = await NoteOperations.listNotes(this, i);
						break;

					case 'note:update':
						responseData = await NoteOperations.updateNote(this, i);
						break;

					case 'note:delete':
						responseData = await NoteOperations.deleteNote(this, i);
						break;

					// PERSON OPERATIONS
					case 'person:find':
						responseData = await PersonOperations.findPerson(this, i);
						break;

					case 'person:create':
						responseData = await PersonOperations.createPerson(this, i);
						break;

					case 'person:update':
						responseData = await PersonOperations.updatePerson(this, i);
						break;

					case 'person:delete':
						responseData = await PersonOperations.deletePerson(this, i);
						break;

					case 'person:listByCompany':
						responseData = await PersonOperations.listPersonsByCompany(this, i);
						break;

					// COMPANY OPERATIONS
					case 'company:find':
						responseData = await CompanyOperations.findCompany(this, i);
						break;

					case 'company:create':
						responseData = await CompanyOperations.createCompany(this, i);
						break;

					case 'company:update':
						responseData = await CompanyOperations.updateCompany(this, i);
						break;

					case 'company:delete':
						responseData = await CompanyOperations.deleteCompany(this, i);
						break;

					// OPPORTUNITY OPERATIONS
					case 'opportunity:find':
						responseData = await OpportunityOperations.findOpportunity(this, i);
						break;

					case 'opportunity:create':
						responseData = await OpportunityOperations.createOpportunity(this, i);
						break;

					case 'opportunity:update':
						responseData = await OpportunityOperations.updateOpportunity(this, i);
						break;

					case 'opportunity:delete':
						responseData = await OpportunityOperations.deleteOpportunity(this, i);
						break;

					case 'opportunity:list':
						responseData = await OpportunityOperations.listOpportunities(this, i);
						break;

					default:
						throw new NodeOperationError(this.getNode(), `Unknown resource:operation combination: ${resourceOperation}`);
				}
				} else if (useCase) {
					// Legacy useCase-based logic for backward compatibility
					switch (useCase) {
					// NOTE OPERATIONS
					case 'createNote':
						responseData = await NoteOperations.createNote(this, i);
						break;

					case 'listNotes':
						responseData = await NoteOperations.listNotes(this, i);
						break;

					case 'updateNote':
						responseData = await NoteOperations.updateNote(this, i);
						break;

					case 'deleteNote':
						responseData = await NoteOperations.deleteNote(this, i);
						break;

					// PERSON OPERATIONS
					case 'findPerson':
						responseData = await PersonOperations.findPerson(this, i);
						break;

					case 'createPerson':
						responseData = await PersonOperations.createPerson(this, i);
						break;

					case 'updatePerson':
						responseData = await PersonOperations.updatePerson(this, i);
						break;

					case 'deletePerson':
						responseData = await PersonOperations.deletePerson(this, i);
						break;

					case 'listPersonsByCompany':
						responseData = await PersonOperations.listPersonsByCompany(this, i);
						break;

					// COMPANY OPERATIONS
					case 'findCompany':
						responseData = await CompanyOperations.findCompany(this, i);
						break;

					case 'createCompany':
						responseData = await CompanyOperations.createCompany(this, i);
						break;

					case 'updateCompany':
						responseData = await CompanyOperations.updateCompany(this, i);
						break;

					case 'deleteCompany':
						responseData = await CompanyOperations.deleteCompany(this, i);
						break;

					// OPPORTUNITY OPERATIONS
					case 'findOpportunity':
						responseData = await OpportunityOperations.findOpportunity(this, i);
						break;

					case 'createOpportunity':
						responseData = await OpportunityOperations.createOpportunity(this, i);
						break;

					case 'updateOpportunity':
						responseData = await OpportunityOperations.updateOpportunity(this, i);
						break;

					case 'deleteOpportunity':
						responseData = await OpportunityOperations.deleteOpportunity(this, i);
						break;

					case 'listOpportunities':
						responseData = await OpportunityOperations.listOpportunities(this, i);
						break;

					// LEGACY OPERATIONS (deprecated but maintained for backward compatibility)
					case 'addContact':
						responseData = await PersonOperations.createPerson(this, i);
						break;

					case 'addCompany':
						responseData = await CompanyOperations.createCompany(this, i);
						break;

					case 'findOrCreateContact':
						responseData = await PersonOperations.createPerson(this, i);
						break;

					case 'findOrCreateCompany':
						responseData = await CompanyOperations.createCompany(this, i);
						break;

					case 'updateContactByEmail':
						responseData = await PersonOperations.updatePerson(this, i);
						break;

					case 'updateCompanyByName':
						responseData = await CompanyOperations.updateCompany(this, i);
						break;

					case 'deleteContactByEmail':
						responseData = await PersonOperations.deletePerson(this, i);
						break;

					case 'deleteCompanyByName':
						responseData = await CompanyOperations.deleteCompany(this, i);
						break;

					default:
						throw new NodeOperationError(this.getNode(), `Unknown use case: ${useCase}`);
				}
				} else {
					throw new NodeOperationError(this.getNode(), 'Neither resource+operation nor useCase parameters found');
				}

				returnData.push({ json: responseData });

			} catch (error) {
				if (this.continueOnFail()) {
					let operation_info = {};
					try {
						const resource = this.getNodeParameter('resource', i) as string;
						const operation = this.getNodeParameter('operation', i) as string;
						operation_info = { resource, operation };
					} catch {
						try {
							const useCase = this.getNodeParameter('useCase', i) as string;
							operation_info = { useCase };
						} catch {
							operation_info = { error: 'No operation parameters found' };
						}
					}

					returnData.push({
						json: { 
							error: error.message,
							...operation_info,
							success: false,
						},
						error,
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
