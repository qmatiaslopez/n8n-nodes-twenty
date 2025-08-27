import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';

import {
	findOrCreateContact,
	findOrCreateCompany,
	updateContactByEmail,
	updateCompanyByName,
	twentyApiRequest,
	prepareRequestBody,
	findPersonUnified,
	findCompanyUnified,
	listPersonsByCompany,
} from './GenericFunctions';

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
						name: 'Find Person',
						value: 'findPerson',
						description: 'Search for a person using various criteria',
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
					{ name: 'Name', value: 'name' },
					{ name: 'Custom Field', value: 'customField' },
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
					{ name: 'Domain', value: 'domain' },
					{ name: 'Custom Field', value: 'customField' },
				],
				displayOptions: {
					show: {
						useCase: ['findCompany'],
					},
				},
				default: 'name',
				description: 'How to search for the company',
			},

			// Custom field name (for find operations)
			{
				displayName: 'Custom Field Name',
				name: 'customFieldName',
				type: 'string',
				displayOptions: {
					show: {
						useCase: ['findPerson', 'findCompany'],
						searchBy: ['customField'],
					},
				},
				default: '',
				placeholder: 'instagram, linkedin, etc.',
				description: 'Field name (will try with "Link" suffix if not found)',
			},

			// Search value (unified for all search operations)
			{
				displayName: 'Search Value',
				name: 'searchValue',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: ['findPerson', 'findCompany'],
					},
				},
				default: '',
				placeholder: 'Value to search for',
				description: 'The value to search for in the selected field',
			},


			// Contact creation fields
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: ['addContact', 'createPerson'],
					},
				},
				default: '',
				description: 'First name of the contact',
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

			// Search configuration for delete/update person
			{
				displayName: 'Search By',
				name: 'updateSearchBy',
				type: 'options',
				options: [
					{ name: 'Email', value: 'email' },
					{ name: 'Phone', value: 'phone' },
					{ name: 'Name', value: 'name' },
					{ name: 'Custom Field', value: 'customField' },
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
					{ name: 'Domain', value: 'domain' },
					{ name: 'Custom Field', value: 'customField' },
				],
				displayOptions: {
					show: {
						useCase: ['deleteCompany', 'updateCompany'],
					},
				},
				default: 'name',
				description: 'How to search for the company',
			},

			// Custom field name (for delete/update operations)
			{
				displayName: 'Custom Field Name',
				name: 'updateCustomFieldName',
				type: 'string',
				displayOptions: {
					show: {
						useCase: ['deletePerson', 'updatePerson', 'deleteCompany', 'updateCompany'],
						updateSearchBy: ['customField'],
					},
				},
				default: '',
				placeholder: 'instagram, linkedin, etc.',
				description: 'Field name (will try with "Link" suffix if not found)',
			},

			// Search value (for delete/update operations)
			{
				displayName: 'Search Value',
				name: 'updateSearchValue',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: ['deletePerson', 'updatePerson', 'deleteCompany', 'updateCompany'],
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
						displayName: 'Position',
						name: 'position',
						type: 'number',
						default: 0,
						description: 'Position in list ordering',
					},
					{
						displayName: 'Company ID',
						name: 'companyId',
						type: 'string',
						default: '',
						description: 'UUID of the company this person belongs to',
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
					// NEW UNIFIED OPERATIONS
					case 'findPerson': {
						const searchBy = this.getNodeParameter('searchBy', i) as string;
						const searchValue = this.getNodeParameter('searchValue', i) as string;
						const customFieldName = searchBy === 'customField' 
							? this.getNodeParameter('customFieldName', i) as string 
							: undefined;

						const result = await findPersonUnified.call(
							this, 
							searchBy, 
							searchValue, 
							customFieldName,
							true
						);
						
						responseData = {
							found: result.found,
							person: result.person,
							confidence: result.confidence,
							recordId: result.person?.id || null,
							searchMethod: result.searchMethod,
							searchValue: result.searchValue,
							totalMatches: result.totalMatches || 0,
							message: result.found 
								? `Person found: ${result.person.name?.firstName || ''} ${result.person.name?.lastName || ''}`.trim()
								: `No person found with ${result.searchMethod}: ${result.searchValue}`,
						};
						break;
					}

					case 'findCompany': {
						const searchBy = this.getNodeParameter('searchBy', i) as string;
						const searchValue = this.getNodeParameter('searchValue', i) as string;
						const customFieldName = searchBy === 'customField' 
							? this.getNodeParameter('customFieldName', i) as string 
							: undefined;

						const result = await findCompanyUnified.call(
							this, 
							searchBy, 
							searchValue, 
							customFieldName,
							true
						);
						
						responseData = {
							found: result.found,
							company: result.company,
							confidence: result.confidence,
							recordId: result.company?.id || null,
							searchMethod: result.searchMethod,
							searchValue: result.searchValue,
							totalMatches: result.totalMatches || 0,
							message: result.found 
								? `Company found: ${result.company.name}`
								: `No company found with ${result.searchMethod}: ${result.searchValue}`,
						};
						break;
					}

					case 'listPersonsByCompany': {
						const companySearchBy = this.getNodeParameter('companySearchBy', i, 'name') as string;
						const companyIdentifier = this.getNodeParameter('companyIdentifier', i) as string;
						
						let companyId = companyIdentifier;
						
						// If searching by name, find the company first
						if (companySearchBy === 'name') {
							const findResult = await findCompanyUnified.call(this, 'name', companyIdentifier, undefined, false);
							if (!findResult.found) {
								responseData = {
									companyId: null,
									people: [],
									totalCount: 0,
									error: 'Company not found',
									message: `Company not found: ${companyIdentifier}`,
								};
								break;
							}
							companyId = findResult.company.id;
						}

						const result = await listPersonsByCompany.call(this, companyId);
						
						responseData = {
							companyId: result.companyId,
							companySearchBy: companySearchBy,
							companyIdentifier: companyIdentifier,
							people: result.people,
							totalCount: result.totalCount,
							message: `Found ${result.totalCount} people in company`,
						};
						break;
					}

					case 'createPerson': {
						const firstName = this.getNodeParameter('firstName', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const personData: IDataObject = {
							name: { firstName, lastName: additionalFields.lastName || '' },
						};

						// Map all person fields from additionalFields
						if (additionalFields.email) {
							personData.emails = { primaryEmail: additionalFields.email };
						}
						
						if (additionalFields.phone || additionalFields.phoneCountryCode || additionalFields.phoneCallingCode) {
							personData.phones = {
								primaryPhoneNumber: additionalFields.phone || '',
								primaryPhoneCountryCode: additionalFields.phoneCountryCode || '',
								primaryPhoneCallingCode: additionalFields.phoneCallingCode || '',
								additionalPhones: []
							};
						}

						if (additionalFields.jobTitle) personData.jobTitle = additionalFields.jobTitle;
						if (additionalFields.city) personData.city = additionalFields.city;
						if (additionalFields.avatarUrl) personData.avatarUrl = additionalFields.avatarUrl;
						if (additionalFields.position) personData.position = additionalFields.position;
						if (additionalFields.companyId) personData.companyId = additionalFields.companyId;

						if (additionalFields.linkedinUrl) {
							personData.linkedinLink = { primaryLinkUrl: additionalFields.linkedinUrl };
						}
						
						if (additionalFields.xUrl) {
							personData.xLink = { primaryLinkUrl: additionalFields.xUrl };
						}

						const result = await findOrCreateContact.call(this, personData);
						
						responseData = {
							created: result.created,
							action: result.action,
							person: result.person,
							confidence: result.confidence,
							recordId: result.person?.id,
							message: result.created 
								? `Person created: ${firstName} ${additionalFields.lastName || ''}`
								: `Person already exists: ${firstName} ${additionalFields.lastName || ''}`,
						};
						break;
					}

					case 'createCompany': {
						const companyName = this.getNodeParameter('companyName', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const companyData: IDataObject = { name: companyName };
						
						if (additionalFields.domain) {
							companyData.domainName = { 
								primaryLinkUrl: additionalFields.domain.startsWith('http') 
									? additionalFields.domain 
									: `https://${additionalFields.domain}` 
							};
						}
						
						if (additionalFields.employees) companyData.employees = additionalFields.employees;
						
						// Handle address
						if (additionalFields.addressStreet1 || additionalFields.addressCity || 
							additionalFields.addressPostcode || additionalFields.addressState || 
							additionalFields.addressCountry) {
							companyData.address = {
								addressStreet1: additionalFields.addressStreet1 || '',
								addressStreet2: additionalFields.addressStreet2 || '',
								addressCity: additionalFields.addressCity || '',
								addressPostcode: additionalFields.addressPostcode || '',
								addressState: additionalFields.addressState || '',
								addressCountry: additionalFields.addressCountry || '',
							};
						}

						// Handle revenue
						if (additionalFields.annualRecurringRevenueMicros || additionalFields.currencyCode) {
							companyData.annualRecurringRevenue = {
								amountMicros: additionalFields.annualRecurringRevenueMicros || 0,
								currencyCode: additionalFields.currencyCode || 'USD',
							};
						}

						if (additionalFields.companyLinkedinUrl) {
							companyData.linkedinLink = { primaryLinkUrl: additionalFields.companyLinkedinUrl };
						}
						
						if (additionalFields.companyXUrl) {
							companyData.xLink = { primaryLinkUrl: additionalFields.companyXUrl };
						}

						const result = await findOrCreateCompany.call(this, companyData);
						
						responseData = {
							created: result.created,
							action: result.action,
							company: result.company,
							confidence: result.confidence,
							recordId: result.company?.id,
							message: result.created 
								? `Company created: ${companyName}`
								: `Company already exists: ${companyName}`,
						};
						break;
					}

					case 'deletePerson': {
						const searchBy = this.getNodeParameter('updateSearchBy', i) as string;
						const searchValue = this.getNodeParameter('updateSearchValue', i) as string;
						const customFieldName = searchBy === 'customField' 
							? this.getNodeParameter('updateCustomFieldName', i) as string 
							: undefined;

						// First find the person using unified search
						const findResult = await findPersonUnified.call(
							this, 
							searchBy, 
							searchValue, 
							customFieldName,
							false
						);
						
						if (!findResult.found) {
							responseData = {
								deleted: false,
								error: 'Person not found',
								searchMethod: searchBy,
								searchValue: searchValue,
								message: `Person not found with ${searchBy}: ${searchValue}`,
							};
							break;
						}

						const personId = findResult.person.id;

						try {
							await twentyApiRequest.call(this, 'DELETE', `/people/${personId}`);
							responseData = {
								deleted: true,
								personId,
								searchMethod: searchBy,
								searchValue: searchValue,
								confidence: findResult.confidence,
								message: `Person deleted: ${searchValue}`,
							};
						} catch (error) {
							responseData = {
								deleted: false,
								error: error.message,
								searchMethod: searchBy,
								searchValue: searchValue,
								message: `Delete failed: ${error.message}`,
							};
						}
						break;
					}

					case 'deleteCompany': {
						const searchBy = this.getNodeParameter('updateSearchBy', i) as string;
						const searchValue = this.getNodeParameter('updateSearchValue', i) as string;
						const customFieldName = searchBy === 'customField' 
							? this.getNodeParameter('updateCustomFieldName', i) as string 
							: undefined;

						// First find the company using unified search
						const findResult = await findCompanyUnified.call(
							this, 
							searchBy, 
							searchValue, 
							customFieldName,
							false
						);
						
						if (!findResult.found || findResult.confidence < 0.9) {
							responseData = {
								deleted: false,
								error: findResult.found 
									? 'No exact match found, delete cancelled' 
									: 'Company not found',
								searchMethod: searchBy,
								searchValue: searchValue,
								confidence: findResult.confidence || 0,
								message: `Company not found or no exact match with ${searchBy}: ${searchValue}`,
							};
							break;
						}

						const companyId = findResult.company.id;

						try {
							await twentyApiRequest.call(this, 'DELETE', `/companies/${companyId}`);
							responseData = {
								deleted: true,
								companyId,
								searchMethod: searchBy,
								searchValue: searchValue,
								confidence: findResult.confidence,
								message: `Company deleted: ${searchValue}`,
							};
						} catch (error) {
							responseData = {
								deleted: false,
								error: error.message,
								searchMethod: searchBy,
								searchValue: searchValue,
								message: `Delete failed: ${error.message}`,
							};
						}
						break;
					}

					case 'updatePerson': {
						const searchBy = this.getNodeParameter('updateSearchBy', i) as string;
						const searchValue = this.getNodeParameter('updateSearchValue', i) as string;
						const customFieldName = searchBy === 'customField' 
							? this.getNodeParameter('updateCustomFieldName', i) as string 
							: undefined;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						// First find the person using unified search
						const findResult = await findPersonUnified.call(
							this, 
							searchBy, 
							searchValue, 
							customFieldName,
							false
						);
						
						if (!findResult.found) {
							responseData = {
								updated: false,
								error: 'Person not found',
								searchMethod: searchBy,
								searchValue: searchValue,
								message: `Person not found with ${searchBy}: ${searchValue}`,
							};
							break;
						}

						const personId = findResult.person.id;
						const updateData: IDataObject = {};

						// Build update data from additionalFields
						if (additionalFields.firstName || additionalFields.lastName) {
							updateData.name = { 
								firstName: additionalFields.firstName || findResult.person.name?.firstName || '', 
								lastName: additionalFields.lastName || findResult.person.name?.lastName || '' 
							};
						}

						if (additionalFields.email) {
							updateData.emails = { primaryEmail: additionalFields.email };
						}

						if (additionalFields.phone || additionalFields.phoneCountryCode || additionalFields.phoneCallingCode) {
							updateData.phones = {
								primaryPhoneNumber: additionalFields.phone || '',
								primaryPhoneCountryCode: additionalFields.phoneCountryCode || '',
								primaryPhoneCallingCode: additionalFields.phoneCallingCode || '',
							};
						}

						if (additionalFields.jobTitle !== undefined) updateData.jobTitle = additionalFields.jobTitle;
						if (additionalFields.city !== undefined) updateData.city = additionalFields.city;
						if (additionalFields.avatarUrl !== undefined) updateData.avatarUrl = additionalFields.avatarUrl;
						if (additionalFields.position !== undefined) updateData.position = additionalFields.position;
						if (additionalFields.companyId !== undefined) updateData.companyId = additionalFields.companyId;

						if (additionalFields.linkedinUrl) {
							updateData.linkedinLink = { primaryLinkUrl: additionalFields.linkedinUrl };
						}
						
						if (additionalFields.xUrl) {
							updateData.xLink = { primaryLinkUrl: additionalFields.xUrl };
						}

						try {
							const processedData = prepareRequestBody(updateData);
							const response = await twentyApiRequest.call(this, 'PUT', `/people/${personId}`, processedData);
							const updatedPerson = response.data?.updatePerson;
							
							responseData = {
								updated: true,
								person: updatedPerson,
								originalPerson: findResult.person,
								searchMethod: searchBy,
								searchValue: searchValue,
								recordId: updatedPerson?.id,
								message: `Person updated: ${searchValue}`,
							};
						} catch (error) {
							responseData = {
								updated: false,
								error: error.message,
								searchMethod: searchBy,
								searchValue: searchValue,
								message: `Update failed: ${error.message}`,
							};
						}
						break;
					}

					case 'updateCompany': {
						const searchBy = this.getNodeParameter('updateSearchBy', i) as string;
						const searchValue = this.getNodeParameter('updateSearchValue', i) as string;
						const customFieldName = searchBy === 'customField' 
							? this.getNodeParameter('updateCustomFieldName', i) as string 
							: undefined;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						// First find the company using unified search
						const findResult = await findCompanyUnified.call(
							this, 
							searchBy, 
							searchValue, 
							customFieldName,
							false
						);
						
						if (!findResult.found || findResult.confidence < 0.8) {
							responseData = {
								updated: false,
								error: findResult.found 
									? 'No exact match found, update cancelled' 
									: 'Company not found',
								searchMethod: searchBy,
								searchValue: searchValue,
								confidence: findResult.confidence || 0,
								message: `Company not found or low confidence match with ${searchBy}: ${searchValue}`,
							};
							break;
						}

						const companyId = findResult.company.id;
						const updateData: IDataObject = {};

						if (additionalFields.companyName !== undefined) updateData.name = additionalFields.companyName;
						
						if (additionalFields.domain) {
							updateData.domainName = { 
								primaryLinkUrl: additionalFields.domain.startsWith('http') 
									? additionalFields.domain 
									: `https://${additionalFields.domain}` 
							};
						}
						
						if (additionalFields.employees !== undefined) updateData.employees = additionalFields.employees;

						// Handle address updates
						if (additionalFields.addressStreet1 !== undefined || additionalFields.addressCity !== undefined || 
							additionalFields.addressPostcode !== undefined || additionalFields.addressState !== undefined || 
							additionalFields.addressCountry !== undefined) {
							updateData.address = {
								addressStreet1: additionalFields.addressStreet1 || '',
								addressStreet2: additionalFields.addressStreet2 || '',
								addressCity: additionalFields.addressCity || '',
								addressPostcode: additionalFields.addressPostcode || '',
								addressState: additionalFields.addressState || '',
								addressCountry: additionalFields.addressCountry || '',
							};
						}

						// Handle revenue updates
						if (additionalFields.annualRecurringRevenueMicros !== undefined || additionalFields.currencyCode !== undefined) {
							updateData.annualRecurringRevenue = {
								amountMicros: additionalFields.annualRecurringRevenueMicros || 0,
								currencyCode: additionalFields.currencyCode || 'USD',
							};
						}

						if (additionalFields.companyLinkedinUrl) {
							updateData.linkedinLink = { primaryLinkUrl: additionalFields.companyLinkedinUrl };
						}
						
						if (additionalFields.companyXUrl) {
							updateData.xLink = { primaryLinkUrl: additionalFields.companyXUrl };
						}

						try {
							const processedData = prepareRequestBody(updateData);
							const response = await twentyApiRequest.call(this, 'PUT', `/companies/${companyId}`, processedData);
							const updatedCompany = response.data?.updateCompany;
							
							responseData = {
								updated: true,
								company: updatedCompany,
								originalCompany: findResult.company,
								searchMethod: searchBy,
								searchValue: searchValue,
								confidence: findResult.confidence,
								recordId: updatedCompany?.id,
								message: `Company updated: ${searchValue}`,
							};
						} catch (error) {
							responseData = {
								updated: false,
								error: error.message,
								searchMethod: searchBy,
								searchValue: searchValue,
								message: `Update failed: ${error.message}`,
							};
						}
						break;
					}


					case 'addContact': {
						const firstName = this.getNodeParameter('firstName', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;
						const email = this.getNodeParameter('emailAddress', i, '') as string;

						const contactData: IDataObject = {
							name: { firstName, lastName: additionalFields.lastName || '' },
						};

						if (email) contactData.email = email;
						if (additionalFields.phone) contactData.phone = additionalFields.phone;
						if (additionalFields.position) contactData.position = additionalFields.position;
						if (additionalFields.city) contactData.city = additionalFields.city;
						if (additionalFields.companyId) contactData.companyId = additionalFields.companyId;

						const result = await findOrCreateContact.call(this, contactData);
						
						responseData = {
							created: result.created,
							action: result.action,
							person: result.person,
							confidence: result.confidence,
							recordId: result.person?.id,
							message: result.created 
								? `Contact created: ${firstName} ${additionalFields.lastName || ''}`
								: `Contact already exists: ${firstName} ${additionalFields.lastName || ''}`,
						};
						break;
					}

					case 'addCompany': {
						const companyName = this.getNodeParameter('companyName', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const companyData: IDataObject = { name: companyName };
						if (additionalFields.domain) companyData.domain = additionalFields.domain;
						if (additionalFields.address) companyData.address = additionalFields.address;
						if (additionalFields.employees) companyData.employees = additionalFields.employees;

						const result = await findOrCreateCompany.call(this, companyData);
						
						responseData = {
							created: result.created,
							action: result.action,
							company: result.company,
							confidence: result.confidence,
							recordId: result.company?.id,
							message: result.created 
								? `Company created: ${companyName}`
								: `Company already exists: ${companyName}`,
						};
						break;
					}

					case 'findOrCreateContact': {
						const email = this.getNodeParameter('emailAddress', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const contactData: IDataObject = { email };
						if (additionalFields.firstName || additionalFields.lastName) {
							contactData.name = { 
								firstName: additionalFields.firstName || '', 
								lastName: additionalFields.lastName || '' 
							};
						}
						if (additionalFields.phone) contactData.phone = additionalFields.phone;
						if (additionalFields.position) contactData.position = additionalFields.position;
						if (additionalFields.city) contactData.city = additionalFields.city;
						if (additionalFields.companyId) contactData.companyId = additionalFields.companyId;

						const result = await findOrCreateContact.call(this, contactData);
						
						responseData = {
							action: result.action,
							person: result.person,
							confidence: result.confidence,
							created: result.created,
							recordId: result.person?.id,
							message: result.created 
								? `Contact created for: ${email}`
								: `Contact found for: ${email}`,
						};
						break;
					}

					case 'findOrCreateCompany': {
						const companyName = this.getNodeParameter('companyName', i, '') as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						if (!companyName && !additionalFields.domain) {
							throw new NodeOperationError(this.getNode(), 'Either company name or domain must be provided');
						}

						const companyData: IDataObject = {};
						if (companyName) companyData.name = companyName;
						if (additionalFields.domain) companyData.domain = additionalFields.domain;
						if (additionalFields.address) companyData.address = additionalFields.address;
						if (additionalFields.employees) companyData.employees = additionalFields.employees;

						const result = await findOrCreateCompany.call(this, companyData);
						
						responseData = {
							action: result.action,
							company: result.company,
							confidence: result.confidence,
							created: result.created,
							foundBy: result.foundBy || null,
							recordId: result.company?.id,
							message: result.created 
								? `Company created: ${companyName || additionalFields.domain}`
								: `Company found: ${companyName || additionalFields.domain}`,
						};
						break;
					}

					case 'updateContactByEmail': {
						const email = this.getNodeParameter('emailAddress', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const updateData: IDataObject = {};
						if (additionalFields.firstName || additionalFields.lastName) {
							updateData.name = { 
								firstName: additionalFields.firstName || '', 
								lastName: additionalFields.lastName || '' 
							};
						}
						if (additionalFields.phone) updateData.phone = { primaryPhoneNumber: additionalFields.phone };
						if (additionalFields.position) updateData.position = additionalFields.position;
						if (additionalFields.city) updateData.city = additionalFields.city;

						const result = await updateContactByEmail.call(this, email, updateData);
						
						responseData = {
							updated: result.updated,
							person: result.person,
							originalPerson: result.originalPerson,
							error: result.error || null,
							recordId: result.person?.id,
							message: result.updated 
								? `Contact updated: ${email}`
								: `Update failed: ${result.error}`,
						};
						break;
					}

					case 'updateCompanyByName': {
						const companyName = this.getNodeParameter('companyName', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const updateData: IDataObject = {};
						if (additionalFields.domain) {
							updateData.domainName = { 
								primaryLinkUrl: additionalFields.domain.startsWith('http') 
									? additionalFields.domain 
									: `https://${additionalFields.domain}` 
							};
						}
						if (additionalFields.address) updateData.address = additionalFields.address;
						if (additionalFields.employees !== undefined) updateData.employees = additionalFields.employees;

						const result = await updateCompanyByName.call(this, companyName, updateData);
						
						responseData = {
							updated: result.updated,
							company: result.company,
							originalCompany: result.originalCompany,
							confidence: result.confidence || 0,
							error: result.error || null,
							recordId: result.company?.id,
							message: result.updated 
								? `Company updated: ${companyName}`
								: `Update failed: ${result.error}`,
						};
						break;
					}


					case 'deleteContactByEmail': {
						const email = this.getNodeParameter('emailAddress', i) as string;

						// First find the contact using unified search
						const findResult = await findPersonUnified.call(this, 'email', email, undefined, false);
						if (!findResult.found) {
							responseData = {
								deleted: false,
								error: 'Contact not found',
								message: `Contact not found: ${email}`,
							};
							break;
						}

						const personId = findResult.person.id;

						try {
							await twentyApiRequest.call(this, 'DELETE', `/people/${personId}`);
							responseData = {
								deleted: true,
								personId,
								message: `Contact deleted: ${email}`,
							};
						} catch (error) {
							responseData = {
								deleted: false,
								error: error.message,
								message: `Delete failed: ${error.message}`,
							};
						}
						break;
					}

					case 'deleteCompanyByName': {
						const companyName = this.getNodeParameter('companyName', i) as string;

						// First find the company using unified search
						const findResult = await findCompanyUnified.call(this, 'name', companyName, undefined, false);
						if (!findResult.found || findResult.confidence < 0.9) {
							responseData = {
								deleted: false,
								error: findResult.found 
									? 'No exact match found, delete cancelled' 
									: 'Company not found',
								message: `Company not found or no exact match: ${companyName}`,
							};
							break;
						}

						const companyId = findResult.company.id;

						try {
							await twentyApiRequest.call(this, 'DELETE', `/companies/${companyId}`);
							responseData = {
								deleted: true,
								companyId,
								confidence: findResult.confidence,
								message: `Company deleted: ${companyName}`,
							};
						} catch (error) {
							responseData = {
								deleted: false,
								error: error.message,
								message: `Delete failed: ${error.message}`,
							};
						}
						break;
					}

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
