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

export class Twenty implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twenty CRM',
		name: 'twenty',
		icon: 'file:twenty.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["useCase"]}}',
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
				displayName: 'What Do You Want to Do?',
				name: 'useCase',
				type: 'options',
				options: [
					{
						name: 'Create Company',
						value: 'createCompany',
						description: 'Create a new company',
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

			// Search configuration for unified search operations
			{
				displayName: 'Search By',
				name: 'searchBy',
				type: 'options',
				options: [
					{ name: 'Email', value: 'email' },
					{ name: 'Phone', value: 'phone' },
					{ name: 'LinkedIn', value: 'linkedin' },
				],
				displayOptions: {
					show: {
						useCase: ['findPerson'],
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
				],
				displayOptions: {
					show: {
						useCase: ['findCompany'],
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
					{ name: 'ID/UUID', value: 'id' },
				],
				displayOptions: {
					show: {
						useCase: ['findOpportunity'],
					},
				},
				default: 'name',
				description: 'How to search for the opportunity',
			},


			// Search value (unified for all search operations)
			{
				displayName: 'Search Value',
				name: 'searchValue',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: ['findPerson', 'findCompany', 'findOpportunity'],
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
						useCase: ['createCompany'],
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
						useCase: ['createOpportunity'],
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
					{ name: 'LinkedIn', value: 'linkedin' },
				],
				displayOptions: {
					show: {
						useCase: ['deletePerson', 'updatePerson'],
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
				],
				displayOptions: {
					show: {
						useCase: ['deleteCompany', 'updateCompany'],
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
					{ name: 'ID/UUID', value: 'id' },
				],
				displayOptions: {
					show: {
						useCase: ['deleteOpportunity', 'updateOpportunity'],
					},
				},
				default: 'name',
				description: 'How to search for the opportunity',
			},


			// Search value (for delete/update operations)
			{
				displayName: 'Search Value',
				name: 'updateSearchValue',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: ['deletePerson', 'updatePerson', 'deleteCompany', 'updateCompany', 'deleteOpportunity', 'updateOpportunity'],
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
						useCase: ['listPersonsByCompany'],
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
						useCase: ['listPersonsByCompany'],
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
						useCase: [
							'addContact',
							'findOrCreateContact',
							'updateContactByEmail',
							'syncContactData',
							'createPerson',
							'updatePerson',
						],
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
						useCase: ['updatePerson'],
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
						useCase: ['updateCompany'],
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
						useCase: [
							'addCompany',
							'findOrCreateCompany',
							'updateCompanyByName',
							'createCompany',
							'updateCompany',
						],
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
						useCase: [
							'createOpportunity',
							'updateOpportunity',
						],
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
						useCase: ['listOpportunities'],
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
				const useCase = this.getNodeParameter('useCase', i) as string;
				let responseData: any;

				switch (useCase) {
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

				returnData.push({ json: responseData });

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { 
							error: error.message,
							useCase: this.getNodeParameter('useCase', i),
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
