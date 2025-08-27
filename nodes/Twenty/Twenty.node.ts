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
					// PERSON OPERATIONS
					{
						name: 'Find Person',
						value: 'findPerson',
						description: 'Search for a person using various criteria',
					},
					{
						name: 'Create Person',
						value: 'createPerson',
						description: 'Create a new person',
					},
					{
						name: 'Update Person',
						value: 'updatePerson',
						description: 'Update an existing person',
					},
					{
						name: 'Delete Person',
						value: 'deletePerson',
						description: 'Delete a person',
					},
					{
						name: 'List People by Company',
						value: 'listPersonsByCompany',
						description: 'List all people associated with a company',
					},
					// COMPANY OPERATIONS
					{
						name: 'Find Company',
						value: 'findCompany',
						description: 'Search for a company using various criteria',
					},
					{
						name: 'Create Company',
						value: 'createCompany',
						description: 'Create a new company',
					},
					{
						name: 'Update Company',
						value: 'updateCompany',
						description: 'Update an existing company',
					},
					{
						name: 'Delete Company',
						value: 'deleteCompany',
						description: 'Delete a company',
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

			// Custom field name (for both person and company)
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

			// Company ID for listing people
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: ['listPersonsByCompany'],
					},
				},
				default: '',
				description: 'UUID of the company',
			},

			// Contact creation fields
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: ['addContact'],
					},
				},
				default: '',
				description: 'First name of the contact',
			},

			// Additional fields for contact operations
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
							'addCompany',
							'findOrCreateCompany',
							'updateCompanyByName',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Last Name',
						name: 'lastName',
						type: 'string',
						default: '',
						description: 'Last name of the contact',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'Phone number of the contact',
					},
					{
						displayName: 'Position',
						name: 'position',
						type: 'string',
						default: '',
						description: 'Job position of the contact',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						description: 'City where the contact is located',
					},
					{
						displayName: 'Company ID',
						name: 'companyId',
						type: 'string',
						default: '',
						description: 'UUID of the company this contact belongs to',
					},
					{
						displayName: 'Domain',
						name: 'domain',
						type: 'string',
						default: '',
						description: 'Company website domain',
					},
					{
						displayName: 'Address',
						name: 'address',
						type: 'string',
						default: '',
						description: 'Company address',
					},
					{
						displayName: 'Employees',
						name: 'employees',
						type: 'number',
						default: 0,
						description: 'Number of employees',
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
						const companyId = this.getNodeParameter('companyId', i) as string;

						const result = await listPersonsByCompany.call(this, companyId);
						
						responseData = {
							companyId: result.companyId,
							people: result.people,
							totalCount: result.totalCount,
							message: `Found ${result.totalCount} people in company`,
						};
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

						// First find the contact
						const findResult = await findPersonByEmail.call(this, email, false);
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

						// First find the company with exact match
						const findResult = await findCompanyByName.call(this, companyName, false);
						if (!findResult.found || findResult.confidence < 1.0) {
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
