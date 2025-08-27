import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';

import {
	findPersonByEmail,
	findCompanyByName,
	findCompanyByDomain,
	getPersonFullProfile,
	getCompanyIntelligence,
	findOrCreateContact,
	findOrCreateCompany,
	updateContactByEmail,
	updateCompanyByName,
	syncContactData,
	twentyApiRequest,
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
						name: 'Update Company by Name',
						value: 'updateCompanyByName',
						description: 'Update company information using name as identifier',
					},
					{
						name: 'Update Contact by Email',
						value: 'updateContactByEmail',
						description: 'Update contact information using email as identifier',
					},
					{
						name: 'Find Company by Domain',
						value: 'findCompanyByDomain',
						description: 'Search for a company using its website domain',
					},
					{
						name: 'Add Company',
						value: 'addCompany',
						description: 'Create a new company',
					},
					{
						name: 'Find Company by Name',
						value: 'findCompanyByName',
						description: 'Search for a company using its name',
					},
					{
						name: 'Find or Create Company',
						value: 'findOrCreateCompany',
						description: 'Find company by name/domain, create if not found',
					},
					{
						name: 'Add Contact',
						value: 'addContact',
						description: 'Create a new contact',
					},
					{
						name: 'Get Company Intelligence',
						value: 'getCompanyIntel',
						description: 'Get company insights and analytics',
					},
					{
						name: 'Get Full Profile',
						value: 'getFullProfile',
						description: 'Get complete profile with relationships',
					},
					{
						name: 'Sync Contact Data',
						value: 'syncContactData',
						description: 'Smart sync contact data from external sources',
					},
					{
						name: 'Find Contact by Email',
						value: 'findContactByEmail',
						description: 'Search for a person using their email address',
					},
					{
						name: 'Find or Create Contact',
						value: 'findOrCreateContact',
						description: 'Find contact by email, create if not found',
					},
					{
						name: 'Delete Company by Name',
						value: 'deleteCompanyByName',
						description: 'Delete company using name as identifier',
					},
					{
						name: 'Delete Contact by Email',
						value: 'deleteContactByEmail',
						description: 'Delete contact using email as identifier',
					},
				],
				default: 'findContactByEmail',
			},

			// Email field for contact operations
			{
				displayName: 'Email Address',
				name: 'emailAddress',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: [
							'findContactByEmail',
							'findOrCreateContact',
							'updateContactByEmail',
							'syncContactData',
							'deleteContactByEmail',
						],
					},
				},
				default: '',
				placeholder: 'john@example.com',
				description: 'Email address of the contact',
			},

			// Company name field
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: [
							'findCompanyByName',
							'addCompany',
							'findOrCreateCompany',
							'updateCompanyByName',
							'deleteCompanyByName',
						],
					},
				},
				default: '',
				placeholder: 'Acme Corp',
				description: 'Name of the company',
			},

			// Domain field
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: ['findCompanyByDomain'],
					},
				},
				default: '',
				placeholder: 'example.com',
				description: 'Website domain of the company',
			},

			// Person ID for profile
			{
				displayName: 'Person ID',
				name: 'personId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: ['getFullProfile'],
					},
				},
				default: '',
				description: 'UUID of the person',
			},

			// Company ID for intelligence
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						useCase: ['getCompanyIntel'],
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
					case 'findContactByEmail': {
						const email = this.getNodeParameter('emailAddress', i) as string;
						const advancedOptions = this.getNodeParameter('advancedOptions', i, {}) as any;
						const includeRelated = advancedOptions.includeRelated ?? true;

						const result = await findPersonByEmail.call(this, email, includeRelated);
						
						responseData = {
							found: result.found,
							contact: result.person,
							confidence: result.confidence,
							recordId: result.person?.id || null,
							searchEmail: email,
							message: result.found 
								? `Contact found: ${result.person.name?.firstName} ${result.person.name?.lastName}`
								: `No contact found with email: ${email}`,
						};
						break;
					}
					
					case 'findCompanyByName': {
						const companyName = this.getNodeParameter('companyName', i) as string;
						const advancedOptions = this.getNodeParameter('advancedOptions', i, {}) as any;
						const includeRelated = advancedOptions.includeRelated ?? true;

						const result = await findCompanyByName.call(this, companyName, includeRelated);
						
						responseData = {
							found: result.found,
							company: result.company,
							confidence: result.confidence,
							recordId: result.company?.id || null,
							searchName: companyName,
							message: result.found 
								? `Company found: ${result.company.name}`
								: `No company found with name: ${companyName}`,
						};
						break;
					}

					case 'findCompanyByDomain': {
						const domain = this.getNodeParameter('domain', i) as string;
						const advancedOptions = this.getNodeParameter('advancedOptions', i, {}) as any;
						const includeRelated = advancedOptions.includeRelated ?? true;

						const result = await findCompanyByDomain.call(this, domain, includeRelated);
						
						responseData = {
							found: result.found,
							company: result.company,
							confidence: result.confidence,
							recordId: result.company?.id || null,
							searchDomain: domain,
							message: result.found 
								? `Company found: ${result.company.name}`
								: `No company found with domain: ${domain}`,
						};
						break;
					}

					case 'getFullProfile': {
						const personId = this.getNodeParameter('personId', i) as string;

						const result = await getPersonFullProfile.call(this, personId);
						
						responseData = {
							found: result.found,
							person: result.person,
							profile: result.profile,
							recordId: personId,
							message: result.found 
								? `Full profile retrieved for: ${result.person?.name?.firstName} ${result.person?.name?.lastName}`
								: `Person not found with ID: ${personId}`,
						};
						break;
					}

					case 'getCompanyIntel': {
						const companyId = this.getNodeParameter('companyId', i) as string;

						const result = await getCompanyIntelligence.call(this, companyId);
						
						responseData = {
							found: result.found,
							company: result.company,
							intelligence: result.intelligence,
							recordId: companyId,
							message: result.found 
								? `Company intelligence retrieved for: ${result.company?.name}`
								: `Company not found with ID: ${companyId}`,
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

					case 'syncContactData': {
						const email = this.getNodeParameter('emailAddress', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const externalData: IDataObject = {};
						if (additionalFields.firstName) externalData.firstName = additionalFields.firstName;
						if (additionalFields.lastName) externalData.lastName = additionalFields.lastName;
						if (additionalFields.phone) externalData.phone = additionalFields.phone;
						if (additionalFields.position) externalData.position = additionalFields.position;
						if (additionalFields.city) externalData.city = additionalFields.city;

						const result = await syncContactData.call(this, email, externalData);
						
						responseData = {
							action: result.action,
							person: result.person,
							changes: result.changes,
							recordId: result.person?.id,
							message: `Sync complete: ${result.action} (${result.changes.length} changes)`,
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
