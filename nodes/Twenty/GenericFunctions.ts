import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IRequestOptions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
// Simple UUID v4 generator without requiring crypto module

// GraphQL Infrastructure Functions
export async function twentyGraphQLRequest(
	this: IExecuteFunctions,
	query: string,
	variables: IDataObject = {},
) {
	const credentials = await this.getCredentials('twentyApi');

	if (credentials === undefined) {
		throw new NodeOperationError(this.getNode(), 'No credentials returned!');
	}

	const options: IRequestOptions = {
		method: 'POST',
		body: {
			query,
			variables,
		},
		uri: `${credentials.domain}/graphql`,
		json: true,
	};

	try {
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		
		// Check for GraphQL errors
		if (response.errors && response.errors.length > 0) {
			const errorMessages = response.errors.map((error: any) => error.message).join('; ');
			throw new NodeOperationError(this.getNode(), `GraphQL Error: ${errorMessages}`);
		}
		
		return response;
	} catch (error) {
		// Enhance error messages for better UX
		let errorMessage = 'Twenty GraphQL request failed';
		if (error.response?.data?.errors) {
			const errorMessages = error.response.data.errors.map((err: any) => err.message).join('; ');
			errorMessage = `Twenty GraphQL Error: ${errorMessages}`;
		} else if (error.message) {
			errorMessage = `Twenty GraphQL Error: ${error.message}`;
		}
		
		throw new NodeApiError(this.getNode(), error, { message: errorMessage });
	}
}

export function buildGraphQLQuery(
	operation: 'query' | 'mutation',
	operationName: string,
	fields: string,
	variables?: { [key: string]: string },
	filters?: IDataObject,
): string {
	let variableDeclarations = '';
	let operationArgs = '';
	
	if (variables) {
		const varDecls = Object.entries(variables).map(([key, type]) => `$${key}: ${type}`);
		variableDeclarations = `(${varDecls.join(', ')})`;
		
		const varArgs = Object.keys(variables).map(key => `${key}: $${key}`);
		operationArgs = `(${varArgs.join(', ')})`;
	}
	
	// Handle filters/where clauses
	if (filters) {
		const filterArgs = Object.entries(filters).map(([key, value]) => {
			if (typeof value === 'string') {
				return `${key}: "${value}"`;
			}
			return `${key}: ${JSON.stringify(value)}`;
		});
		
		if (variableDeclarations) {
			operationArgs = operationArgs.slice(0, -1) + `, ${filterArgs.join(', ')})`;
		} else {
			operationArgs = `(${filterArgs.join(', ')})`;
		}
	}
	
	return `${operation} ${variableDeclarations} {
		${operationName}${operationArgs} {
			${fields}
		}
	}`;
}

export function buildGraphQLMutation(
	mutationName: string,
	inputType: string,
	fields: string,
): string {
	return `mutation($data: ${inputType}!) {
		${mutationName}(data: $data) {
			${fields}
		}
	}`;
}


// UUID Helper Functions - Keep for GraphQL operations
export function isValidTwentyUuid(value: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
}

// Load Options Methods for Dropdowns - GraphQL
export async function loadCompanies(this: ILoadOptionsFunctions) {
	try {
		const credentials = await this.getCredentials('twentyApi');
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials returned!');
		}
		
		const query = `
			query LoadCompanies($first: Int) {
				companies(first: $first) {
					edges {
						node {
							id
							name
						}
					}
				}
			}
		`;

		const options: IRequestOptions = {
			method: 'POST',
			body: {
				query,
				variables: { first: 100 },
			},
			uri: `${credentials.domain}/graphql`,
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		
		if (response.errors && response.errors.length > 0) {
			const errorMessages = response.errors.map((error: any) => error.message).join('; ');
			throw new NodeOperationError(this.getNode(), `GraphQL Error: ${errorMessages}`);
		}
		
		const companies = response.data?.companies?.edges.map((edge: any) => edge.node) || [];
		
		return companies.map((company: any) => ({
			name: company.name || `Company ${company.id.slice(0, 8)}`,
			value: company.id,
		}));
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load companies: ${error.message}`);
	}
}

export async function loadPeople(this: ILoadOptionsFunctions) {
	try {
		const credentials = await this.getCredentials('twentyApi');
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials returned!');
		}
		
		const query = `
			query LoadPeople($first: Int) {
				people(first: $first) {
					edges {
						node {
							id
							name {
								firstName
								lastName
							}
						}
					}
				}
			}
		`;

		const options: IRequestOptions = {
			method: 'POST',
			body: {
				query,
				variables: { first: 100 },
			},
			uri: `${credentials.domain}/graphql`,
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		
		if (response.errors && response.errors.length > 0) {
			const errorMessages = response.errors.map((error: any) => error.message).join('; ');
			throw new NodeOperationError(this.getNode(), `GraphQL Error: ${errorMessages}`);
		}
		
		const people = response.data?.people?.edges.map((edge: any) => edge.node) || [];
		
		return people.map((person: any) => ({
			name: `${person.name?.firstName || ''} ${person.name?.lastName || ''}`.trim() || `Person ${person.id.slice(0, 8)}`,
			value: person.id,
		}));
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load people: ${error.message}`);
	}
}

export async function loadOpportunities(this: ILoadOptionsFunctions) {
	try {
		const credentials = await this.getCredentials('twentyApi');
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials returned!');
		}
		
		const query = `
			query LoadOpportunities($first: Int) {
				opportunities(first: $first) {
					edges {
						node {
							id
							name
						}
					}
				}
			}
		`;

		const options: IRequestOptions = {
			method: 'POST',
			body: {
				query,
				variables: { first: 100 },
			},
			uri: `${credentials.domain}/graphql`,
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		
		if (response.errors && response.errors.length > 0) {
			const errorMessages = response.errors.map((error: any) => error.message).join('; ');
			throw new NodeOperationError(this.getNode(), `GraphQL Error: ${errorMessages}`);
		}
		
		const opportunities = response.data?.opportunities?.edges.map((edge: any) => edge.node) || [];
		
		return opportunities.map((opportunity: any) => ({
			name: opportunity.name || `Opportunity ${opportunity.id.slice(0, 8)}`,
			value: opportunity.id,
		}));
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load opportunities: ${error.message}`);
	}
}

export async function loadNotes(this: ILoadOptionsFunctions) {
	try {
		const credentials = await this.getCredentials('twentyApi');
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials returned!');
		}
		
		const query = `
			query LoadNotes($first: Int) {
				notes(first: $first) {
					edges {
						node {
							id
							title
						}
					}
				}
			}
		`;

		const options: IRequestOptions = {
			method: 'POST',
			body: {
				query,
				variables: { first: 100 },
			},
			uri: `${credentials.domain}/graphql`,
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		
		if (response.errors && response.errors.length > 0) {
			const errorMessages = response.errors.map((error: any) => error.message).join('; ');
			throw new NodeOperationError(this.getNode(), `GraphQL Error: ${errorMessages}`);
		}
		
		const notes = response.data?.notes?.edges.map((edge: any) => edge.node) || [];
		
		return notes.map((note: any) => ({
			name: note.title || `Note ${note.id.slice(0, 8)}`,
			value: note.id,
		}));
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load notes: ${error.message}`);
	}
}

export async function loadTasks(this: ILoadOptionsFunctions) {
	try {
		const credentials = await this.getCredentials('twentyApi');
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials returned!');
		}
		
		const query = `
			query LoadTasks($first: Int) {
				tasks(first: $first) {
					edges {
						node {
							id
							title
						}
					}
				}
			}
		`;

		const options: IRequestOptions = {
			method: 'POST',
			body: {
				query,
				variables: { first: 100 },
			},
			uri: `${credentials.domain}/graphql`,
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		
		if (response.errors && response.errors.length > 0) {
			const errorMessages = response.errors.map((error: any) => error.message).join('; ');
			throw new NodeOperationError(this.getNode(), `GraphQL Error: ${errorMessages}`);
		}
		
		const tasks = response.data?.tasks?.edges.map((edge: any) => edge.node) || [];
		
		return tasks.map((task: any) => ({
			name: task.title || `Task ${task.id.slice(0, 8)}`,
			value: task.id,
		}));
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load tasks: ${error.message}`);
	}
}

export async function loadMessageThreads(this: ILoadOptionsFunctions) {
	try {
		const credentials = await this.getCredentials('twentyApi');
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials returned!');
		}
		
		const query = `
			query LoadMessageThreads($first: Int) {
				messageThreads(first: $first) {
					edges {
						node {
							id
						}
					}
				}
			}
		`;

		const options: IRequestOptions = {
			method: 'POST',
			body: {
				query,
				variables: { first: 100 },
			},
			uri: `${credentials.domain}/graphql`,
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		
		if (response.errors && response.errors.length > 0) {
			const errorMessages = response.errors.map((error: any) => error.message).join('; ');
			throw new NodeOperationError(this.getNode(), `GraphQL Error: ${errorMessages}`);
		}
		
		const messageThreads = response.data?.messageThreads?.edges.map((edge: any) => edge.node) || [];
		
		return messageThreads.map((thread: any) => ({
			name: `Thread ${thread.id.slice(0, 8)}`,
			value: thread.id,
		}));
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load message threads: ${error.message}`);
	}
}

// Smart Search Functions - REST versions removed, use GraphQL equivalents





// GraphQL equivalent of findOrCreateContact
export async function findOrCreateContactGraphQL(
	this: IExecuteFunctions,
	contactData: IDataObject
) {
	try {
		const email = contactData.email as string;
		
		// First, try to find existing contact using GraphQL
		if (email) {
			const existingResult = await findPersonUnifiedGraphQL.call(this, 'email', email, undefined, true);
			if (existingResult.found) {
				return {
					action: 'found',
					person: existingResult.person,
					confidence: existingResult.confidence,
					created: false,
				};
			}
		}
		
		// Not found, create new contact using GraphQL mutation
		const createData: IDataObject = {};
		
		// Build the input data structure for GraphQL mutation
		if (contactData.name || contactData.firstName || contactData.lastName) {
			const nameData = contactData.name as IDataObject;
			createData.name = {
				firstName: contactData.firstName || nameData?.firstName || '',
				lastName: contactData.lastName || nameData?.lastName || ''
			};
		}
		
		if (contactData.email || contactData.emails) {
			const emailsData = contactData.emails as IDataObject;
			createData.emails = {
				primaryEmail: contactData.email || emailsData?.primaryEmail
			};
		}
		
		if (contactData.phone || contactData.phones) {
			const phonesData = contactData.phones as IDataObject;
			createData.phones = {
				primaryPhoneNumber: contactData.phone || phonesData?.primaryPhoneNumber || '',
				primaryPhoneCountryCode: contactData.phoneCountryCode || phonesData?.primaryPhoneCountryCode || '',
				primaryPhoneCallingCode: contactData.phoneCallingCode || phonesData?.primaryPhoneCallingCode || ''
			};
		}
		
		if (contactData.jobTitle) createData.jobTitle = contactData.jobTitle;
		if (contactData.city) createData.city = contactData.city;
		if (contactData.avatarUrl) createData.avatarUrl = contactData.avatarUrl;
		if (contactData.position) createData.position = contactData.position;
		if (contactData.companyId) createData.companyId = contactData.companyId;
		
		if (contactData.linkedinUrl || contactData.linkedinLink) {
			const linkedinData = contactData.linkedinLink as IDataObject;
			createData.linkedinLink = {
				primaryLinkUrl: contactData.linkedinUrl || linkedinData?.primaryLinkUrl
			};
		}
		
		if (contactData.xUrl || contactData.xLink) {
			const xData = contactData.xLink as IDataObject;
			createData.xLink = {
				primaryLinkUrl: contactData.xUrl || xData?.primaryLinkUrl
			};
		}
		
		// GraphQL mutation to create person
		const mutation = `
			mutation CreatePerson($data: PersonCreateInput!) {
				createPerson(data: $data) {
					id
					name {
						firstName
						lastName
					}
					emails {
						primaryEmail
					}
					phones {
						primaryPhoneNumber
						primaryPhoneCountryCode
						primaryPhoneCallingCode
					}
					jobTitle
					city
					avatarUrl
					linkedinLink {
						primaryLinkUrl
					}
					xLink {
						primaryLinkUrl
					}
					company {
						id
						name
						domainName {
							primaryLinkUrl
						}
					}
				}
			}
		`;
		
		const response = await twentyGraphQLRequest.call(this, mutation, { data: createData });
		const newPerson = response.data?.createPerson;
		
		return {
			action: 'created',
			person: newPerson,
			confidence: 1.0,
			created: true,
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to find or create contact: ${error.message}`
		);
	}
}


// GraphQL equivalent of findOrCreateCompany
export async function findOrCreateCompanyGraphQL(
	this: IExecuteFunctions,
	companyData: IDataObject
) {
	try {
		const name = companyData.name as string;
		const domain = companyData.domain as string;
		
		// First, try to find existing company by name using GraphQL
		if (name) {
			const existingByName = await findCompanyUnifiedGraphQL.call(this, 'name', name, undefined, false);
			if (existingByName.found && existingByName.confidence >= 1.0) {
				return {
					action: 'found',
					company: existingByName.company,
					confidence: existingByName.confidence,
					created: false,
					foundBy: 'name',
				};
			}
		}
		
		// Not found, create new company using GraphQL mutation
		const createData: IDataObject = {};
		
		if (companyData.name) createData.name = companyData.name;
		
		if (domain || companyData.domainName) {
			const domainData = companyData.domainName as IDataObject;
			const domainUrl = domain || domainData?.primaryLinkUrl;
			if (domainUrl) {
				createData.domainName = {
					primaryLinkUrl: (domainUrl as string).startsWith('http') ? domainUrl : `https://${domainUrl}`
				};
			}
		}
		
		if (companyData.employees !== undefined) createData.employees = companyData.employees;
		
		// Handle address
		if (companyData.address || companyData.addressStreet1 || companyData.addressCity || 
			companyData.addressPostcode || companyData.addressState || companyData.addressCountry) {
			const addressData = companyData.address as IDataObject;
			createData.address = {
				addressStreet1: companyData.addressStreet1 || addressData?.addressStreet1 || '',
				addressStreet2: companyData.addressStreet2 || addressData?.addressStreet2 || '',
				addressCity: companyData.addressCity || addressData?.addressCity || '',
				addressPostcode: companyData.addressPostcode || addressData?.addressPostcode || '',
				addressState: companyData.addressState || addressData?.addressState || '',
				addressCountry: companyData.addressCountry || addressData?.addressCountry || '',
			};
		}
		
		// Handle revenue
		if (companyData.annualRecurringRevenue || companyData.annualRecurringRevenueMicros || companyData.currencyCode) {
			const revenueData = companyData.annualRecurringRevenue as IDataObject;
			createData.annualRecurringRevenue = {
				amountMicros: companyData.annualRecurringRevenueMicros || revenueData?.amountMicros || 0,
				currencyCode: companyData.currencyCode || revenueData?.currencyCode || 'USD',
			};
		}
		
		if (companyData.companyLinkedinUrl || companyData.linkedinLink) {
			const linkedinData = companyData.linkedinLink as IDataObject;
			createData.linkedinLink = {
				primaryLinkUrl: companyData.companyLinkedinUrl || linkedinData?.primaryLinkUrl
			};
		}
		
		if (companyData.companyXUrl || companyData.xLink) {
			const xData = companyData.xLink as IDataObject;
			createData.xLink = {
				primaryLinkUrl: companyData.companyXUrl || xData?.primaryLinkUrl
			};
		}
		
		// GraphQL mutation to create company
		const mutation = `
			mutation CreateCompany($data: CompanyCreateInput!) {
				createCompany(data: $data) {
					id
					name
					domainName {
						primaryLinkUrl
					}
					employees
					address {
						addressStreet1
						addressStreet2
						addressCity
						addressPostcode
						addressState
						addressCountry
					}
					annualRecurringRevenue {
						amountMicros
						currencyCode
					}
					linkedinLink {
						primaryLinkUrl
					}
					xLink {
						primaryLinkUrl
					}
					accountOwnerId
					accountOwner {
						id
						name {
							firstName
							lastName
						}
					}
				}
			}
		`;
		
		const response = await twentyGraphQLRequest.call(this, mutation, { data: createData });
		const newCompany = response.data?.createCompany;
		
		return {
			action: 'created',
			company: newCompany,
			confidence: 1.0,
			created: true,
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to find or create company: ${error.message}`
		);
	}
}


// GraphQL equivalent of updateContactByEmail
export async function updateContactByEmailGraphQL(
	this: IExecuteFunctions,
	email: string,
	updateData: IDataObject
) {
	try {
		// Find the contact first using GraphQL
		const findResult = await findPersonUnifiedGraphQL.call(this, 'email', email, undefined, false);
		if (!findResult.found) {
			return {
				updated: false,
				error: 'Contact not found',
				person: null,
			};
		}
		
		const personId = findResult.person.id;
		
		// Build update data structure for GraphQL
		const processedData: IDataObject = {};
		
		if (updateData.name || updateData.firstName || updateData.lastName) {
			const updateNameData = updateData.name as IDataObject;
			const personNameData = findResult.person.name as IDataObject;
			processedData.name = {
				firstName: updateData.firstName || updateNameData?.firstName || personNameData?.firstName || '',
				lastName: updateData.lastName || updateNameData?.lastName || personNameData?.lastName || ''
			};
		}
		
		if (updateData.emails || updateData.email) {
			const emailsData = updateData.emails as IDataObject;
			processedData.emails = {
				primaryEmail: updateData.email || emailsData?.primaryEmail
			};
		}
		
		if (updateData.phones || updateData.phone) {
			const phonesData = updateData.phones as IDataObject;
			processedData.phones = {
				primaryPhoneNumber: updateData.phone || phonesData?.primaryPhoneNumber || '',
				primaryPhoneCountryCode: updateData.phoneCountryCode || phonesData?.primaryPhoneCountryCode || '',
				primaryPhoneCallingCode: updateData.phoneCallingCode || phonesData?.primaryPhoneCallingCode || ''
			};
		}
		
		if (updateData.jobTitle !== undefined) processedData.jobTitle = updateData.jobTitle;
		if (updateData.city !== undefined) processedData.city = updateData.city;
		if (updateData.avatarUrl !== undefined) processedData.avatarUrl = updateData.avatarUrl;
		if (updateData.position !== undefined) processedData.position = updateData.position;
		if (updateData.companyId !== undefined) processedData.companyId = updateData.companyId;
		
		if (updateData.linkedinUrl || updateData.linkedinLink) {
			const linkedinData = updateData.linkedinLink as IDataObject;
			processedData.linkedinLink = {
				primaryLinkUrl: updateData.linkedinUrl || linkedinData?.primaryLinkUrl
			};
		}
		
		if (updateData.xUrl || updateData.xLink) {
			const xData = updateData.xLink as IDataObject;
			processedData.xLink = {
				primaryLinkUrl: updateData.xUrl || xData?.primaryLinkUrl
			};
		}
		
		// GraphQL mutation to update person
		const mutation = `
			mutation UpdatePerson($id: UUID!, $data: PersonUpdateInput!) {
				updatePerson(id: $id, data: $data) {
					id
					name {
						firstName
						lastName
					}
					emails {
						primaryEmail
					}
					phones {
						primaryPhoneNumber
						primaryPhoneCountryCode
						primaryPhoneCallingCode
					}
					jobTitle
					city
					avatarUrl
					linkedinLink {
						primaryLinkUrl
					}
					xLink {
						primaryLinkUrl
					}
					company {
						id
						name
						domainName {
							primaryLinkUrl
						}
					}
				}
			}
		`;
		
		const response = await twentyGraphQLRequest.call(this, mutation, { 
			id: personId, 
			data: processedData 
		});
		const updatedPerson = response.data?.updatePerson;
		
		return {
			updated: true,
			person: updatedPerson,
			originalPerson: findResult.person,
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to update contact by email: ${error.message}`
		);
	}
}




// Field resolution system with fallback
export async function resolveFieldName(
	this: IExecuteFunctions,
	objectType: 'person' | 'company',
	fieldInput: string
): Promise<{
	resolvedField: string | null;
	fieldExists: boolean;
	triedFields: string[];
	fallbackUsed?: boolean;
}> {
	const candidates = [
		fieldInput,                           // Exact: "instagram"
		`${fieldInput}Link`,                 // With suffix: "instagramLink"
		fieldInput.toLowerCase(),            // Lowercase: "Instagram" → "instagram"
		`${fieldInput.toLowerCase()}Link`    // Lowercase + suffix: "instagramLink"
	];
	
	// Remove duplicates while preserving order
	const uniqueCandidates = [...new Set(candidates)];
	
	try {
		// Use GraphQL introspection to get field information
		const typeName = objectType === 'person' ? 'Person' : 'Company';
		const introspectionQuery = `
			query GetTypeFields {
				__schema {
					types(names: ["${typeName}"]) {
						name
						fields {
							name
							type {
								name
							}
						}
					}
				}
			}
		`;
		
		const response = await twentyGraphQLRequest.call(this, introspectionQuery);
		const types = response.data?.__schema?.types || [];
		const targetType = types.find((type: any) => type.name === typeName);
		
		if (!targetType?.fields) {
			return {
				resolvedField: null,
				fieldExists: false,
				triedFields: uniqueCandidates
			};
		}
		
		const availableFields = targetType.fields.map((field: any) => field.name);
		
		// Try each candidate
		for (const candidate of uniqueCandidates) {
			if (availableFields.includes(candidate)) {
				return {
					resolvedField: candidate,
					fieldExists: true,
					triedFields: uniqueCandidates
				};
			}
		}
		
		// No match found
		return {
			resolvedField: null,
			fieldExists: false,
			triedFields: uniqueCandidates
		};
		
	} catch (error) {
		// Fallback: try the field name directly if introspection fails
		const fallbackField = uniqueCandidates[0];
		
		return {
			resolvedField: fallbackField,
			fieldExists: false, // We couldn't validate but we're trying anyway
			triedFields: uniqueCandidates,
			fallbackUsed: true
		};
	}
}

// GraphQL equivalent of resolveFieldName using introspection
export async function resolveFieldNameGraphQL(
	this: IExecuteFunctions,
	objectType: 'person' | 'company',
	fieldInput: string
): Promise<{
	resolvedField: string | null;
	fieldExists: boolean;
	triedFields: string[];
	fallbackUsed?: boolean;
}> {
	const candidates = [
		fieldInput,                           // Exact: "instagram"
		`${fieldInput}Link`,                 // With suffix: "instagramLink"
		fieldInput.toLowerCase(),            // Lowercase: "Instagram" → "instagram"
		`${fieldInput.toLowerCase()}Link`    // Lowercase + suffix: "instagramLink"
	];
	
	// Remove duplicates while preserving order
	const uniqueCandidates = [...new Set(candidates)];
	
	try {
		// Use GraphQL introspection to get field information
		const typeName = objectType === 'person' ? 'Person' : 'Company';
		const introspectionQuery = `
			query GetTypeFields {
				__schema {
					types(names: ["${typeName}"]) {
						name
						fields {
							name
							type {
								name
							}
						}
					}
				}
			}
		`;
		
		const response = await twentyGraphQLRequest.call(this, introspectionQuery);
		const types = response.data?.__schema?.types || [];
		const targetType = types.find((type: any) => type.name === typeName);
		
		if (!targetType?.fields) {
			return {
				resolvedField: null,
				fieldExists: false,
				triedFields: uniqueCandidates
			};
		}
		
		const availableFields = targetType.fields.map((field: any) => field.name);
		
		// Try each candidate
		for (const candidate of uniqueCandidates) {
			if (availableFields.includes(candidate)) {
				return {
					resolvedField: candidate,
					fieldExists: true,
					triedFields: uniqueCandidates
				};
			}
		}
		
		// No match found
		return {
			resolvedField: null,
			fieldExists: false,
			triedFields: uniqueCandidates
		};
		
	} catch (error) {
		// Fallback: try the field name directly if introspection fails
		const fallbackField = uniqueCandidates[0];
		
		return {
			resolvedField: fallbackField,
			fieldExists: false, // We couldn't validate but we're trying anyway
			triedFields: uniqueCandidates,
			fallbackUsed: true
		};
	}
}


// GraphQL equivalent of findPersonUnified
export async function findPersonUnifiedGraphQL(
	this: IExecuteFunctions,
	searchBy: string,
	searchValue: string,
	customFieldName?: string,
	includeRelated: boolean = true
) {
	try {
		// Define the fields to fetch
		const personFields = `
			id
			name {
				firstName
				lastName
			}
			emails {
				primaryEmail
			}
			phones {
				primaryPhoneNumber
				primaryPhoneCountryCode
				primaryPhoneCallingCode
			}
			jobTitle
			city
			avatarUrl
			linkedinLink {
				primaryLinkUrl
			}
			xLink {
				primaryLinkUrl
			}
			${includeRelated ? `
				company {
					id
					name
					domainName {
						primaryLinkUrl
					}
				}
			` : ''}
		`;
		
		// Build GraphQL filter clause based on search criteria
		let filterClause: IDataObject = {};
		
		switch (searchBy) {
			case 'email':
				filterClause = {
					emails: {
						primaryEmail: { eq: searchValue.toLowerCase() }
					}
				};
				break;
			case 'phone':
				filterClause = {
					phones: {
						primaryPhoneNumber: { eq: searchValue }
					}
				};
				break;
			case 'linkedin':
				filterClause = {
					linkedinLink: {
						primaryLinkUrl: { eq: searchValue }
					}
				};
				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unsupported search method: ${searchBy}`
				);
		}
		
		// Build and execute GraphQL query
		const query = `
			query FindPeople($filter: PersonFilterInput, $first: Int) {
				people(filter: $filter, first: $first) {
					edges {
						node {
							${personFields}
						}
					}
					pageInfo {
						hasNextPage
						hasPreviousPage
						startCursor
						endCursor
					}
				}
			}
		`;
		
		const variables = {
			filter: filterClause,
			first: 50
		};
		
		const response = await twentyGraphQLRequest.call(this, query, variables);
		const edges = response.data?.people?.edges || [];
		const people = edges.map((edge: any) => edge.node);
		
		if (people.length === 0) {
			return {
				found: false,
				person: null,
				confidence: 0,
				searchMethod: searchBy,
				searchValue: searchValue
			};
		}
		
		// Return first match with confidence score
		const person = people[0];
		let confidence = 0.8; // Base confidence for exact matches
		
		if (people.length === 1) {
			confidence = 0.95; // Higher confidence for unique matches
		}
		
		return {
			found: true,
			person: person,
			confidence: confidence,
			searchMethod: searchBy,
			searchValue: searchValue,
			totalMatches: people.length
		};
		
	} catch (error) {
		if (error instanceof NodeOperationError) {
			throw error;
		}
		throw new NodeOperationError(
			this.getNode(),
			`Failed to search person: ${error.message}`
		);
	}
}


// GraphQL equivalent of findCompanyUnified
export async function findCompanyUnifiedGraphQL(
	this: IExecuteFunctions,
	searchBy: string,
	searchValue: string,
	customFieldName?: string,
	includeRelated: boolean = true
) {
	try {
		// Define the fields to fetch
		const companyFields = `
			id
			name
			domainName {
				primaryLinkUrl
			}
			employees
			address {
				addressStreet1
				addressStreet2
				addressCity
				addressPostcode
				addressState
				addressCountry
			}
			annualRecurringRevenue {
				amountMicros
				currencyCode
			}
			linkedinLink {
				primaryLinkUrl
			}
			xLink {
				primaryLinkUrl
			}
			${includeRelated ? `
				people {
					edges {
						node {
							id
							name {
								firstName
								lastName
							}
							emails {
								primaryEmail
							}
							jobTitle
						}
					}
				}
			` : ''}
		`;
		
		// Build GraphQL filter clause based on search criteria
		let filterClause: IDataObject = {};
		
		switch (searchBy) {
			case 'name':
				filterClause = {
					name: { ilike: `%${searchValue}%` }
				};
				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unsupported search method: ${searchBy}`
				);
		}
		
		// Build and execute GraphQL query
		const query = `
			query FindCompanies($filter: CompanyFilterInput, $first: Int) {
				companies(filter: $filter, first: $first) {
					edges {
						node {
							${companyFields}
						}
					}
					pageInfo {
						hasNextPage
						hasPreviousPage
						startCursor
						endCursor
					}
				}
			}
		`;
		
		const variables = {
			filter: filterClause,
			first: 50
		};
		
		const response = await twentyGraphQLRequest.call(this, query, variables);
		const edges = response.data?.companies?.edges || [];
		const companies = edges.map((edge: any) => edge.node);
		
		if (companies.length === 0) {
			return {
				found: false,
				company: null,
				confidence: 0,
				searchMethod: searchBy,
				searchValue: searchValue
			};
		}
		
		// Return first match with confidence score
		const company = companies[0];
		let confidence = 0.8; // Base confidence for exact matches
		
		if (companies.length === 1) {
			confidence = 0.95; // Higher confidence for unique matches
		}
		
		return {
			found: true,
			company: company,
			confidence: confidence,
			searchMethod: searchBy,
			searchValue: searchValue,
			totalMatches: companies.length
		};
		
	} catch (error) {
		if (error instanceof NodeOperationError) {
			throw error;
		}
		throw new NodeOperationError(
			this.getNode(),
			`Failed to search company: ${error.message}`
		);
	}
}


// GraphQL equivalent of listPersonsByCompany
export async function listPersonsByCompanyGraphQL(
	this: IExecuteFunctions,
	companyId: string
) {
	try {
		if (!isValidTwentyUuid(companyId)) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid company ID format. Must be a valid UUID.'
			);
		}
		
		// GraphQL query to get people by company
		const query = `
			query GetPeopleByCompany($filter: PersonFilterInput, $first: Int) {
				people(filter: $filter, first: $first) {
					edges {
						node {
							id
							name {
								firstName
								lastName
							}
							emails {
								primaryEmail
							}
							phones {
								primaryPhoneNumber
								primaryPhoneCountryCode
								primaryPhoneCallingCode
							}
							jobTitle
							city
							avatarUrl
							linkedinLink {
								primaryLinkUrl
							}
							xLink {
								primaryLinkUrl
							}
						}
					}
					pageInfo {
						hasNextPage
						hasPreviousPage
						startCursor
						endCursor
					}
				}
			}
		`;
		
		const variables = {
			filter: {
				companyId: { eq: companyId }
			},
			first: 100
		};
		
		const response = await twentyGraphQLRequest.call(this, query, variables);
		const edges = response.data?.people?.edges || [];
		const people = edges.map((edge: any) => edge.node);
		
		return {
			companyId: companyId,
			people: people,
			totalCount: people.length
		};
		
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to list people by company: ${error.message}`
		);
	}
}

// ============================================================================
// OPPORTUNITY-SPECIFIC GRAPHQL FUNCTIONS
// ============================================================================

export async function findOpportunityUnifiedGraphQL(
	this: IExecuteFunctions,
	searchBy: string,
	searchValue: string,
	additionalFields?: IDataObject,
	includeRelated: boolean = true
): Promise<{
	found: boolean;
	opportunity: any;
	confidence: number;
	searchMethod: string;
	searchValue: string;
	totalMatches?: number;
}> {
	try {
		let confidence = 1.0;

		switch (searchBy.toLowerCase()) {
			case 'name':
				confidence = searchValue ? (searchValue.length > 2 ? 0.95 : 0.8) : 0.5;
				break;
			case 'id':
			case 'uuid':
				confidence = 1.0;
				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unsupported search method for opportunity: ${searchBy}`
				);
		}

		const relationFields = includeRelated ? `
			company {
				id
				name
				domainName {
					primaryLinkUrl
				}
			}
			pointOfContact {
				id
				name {
					firstName
					lastName
				}
				emails {
					primaryEmail
				}
			}
		` : '';

		const query = `
			query FindOpportunities($filter: OpportunityFilterInput) {
				opportunities(filter: $filter) {
					edges {
						node {
							id
							name
							amount {
								amountMicros
								currencyCode
							}
							closeDate
							stage
							position
							createdBy {
								source
								name
							}
							createdAt
							updatedAt
							${relationFields}
						}
					}
					totalCount
				}
			}
		`;

		const variables = { filter: { [searchBy === 'id' || searchBy === 'uuid' ? 'id' : searchBy]: { [searchBy === 'name' ? 'ilike' : 'eq']: searchValue } } };
		const response = await twentyGraphQLRequest.call(this, query, variables);

		const opportunities = response.data?.opportunities?.edges || [];
		const totalCount = response.data?.opportunities?.totalCount || 0;

		if (opportunities.length === 0) {
			return {
				found: false,
				opportunity: null,
				confidence: 0,
				searchMethod: searchBy,
				searchValue: searchValue,
				totalMatches: 0,
			};
		}

		// For exact matches (like ID), return first result with high confidence
		if (searchBy === 'id' || searchBy === 'uuid') {
			return {
				found: true,
				opportunity: opportunities[0].node,
				confidence: 1.0,
				searchMethod: searchBy,
				searchValue: searchValue,
				totalMatches: totalCount,
			};
		}

		// For name searches, look for exact match first
		let bestMatch = opportunities[0].node;
		let bestConfidence = confidence;

		if (searchBy === 'name') {
			for (const edge of opportunities) {
				const opportunity = edge.node;
				if (opportunity.name && opportunity.name.toLowerCase() === searchValue.toLowerCase()) {
					bestMatch = opportunity;
					bestConfidence = 1.0;
					break;
				}
			}
		}

		return {
			found: true,
			opportunity: bestMatch,
			confidence: bestConfidence,
			searchMethod: searchBy,
			searchValue: searchValue,
			totalMatches: totalCount,
		};

	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to find opportunity: ${error.message}`
		);
	}
}

export async function findOrCreateOpportunityGraphQL(
	this: IExecuteFunctions,
	opportunityData: IDataObject
): Promise<{
	created: boolean;
	action: string;
	opportunity: any;
	confidence: number;
}> {
	try {
		// First, try to find existing opportunity by name
		if (opportunityData.name) {
			const existingResult = await findOpportunityUnifiedGraphQL.call(
				this,
				'name',
				opportunityData.name as string,
				undefined,
				true
			);

			if (existingResult.found && existingResult.confidence > 0.8) {
				return {
					created: false,
					action: 'found_existing',
					opportunity: existingResult.opportunity,
					confidence: existingResult.confidence,
				};
			}
		}

		// Create new opportunity
		const mutation = `
			mutation CreateOpportunity($data: OpportunityCreateInput!) {
				createOpportunity(data: $data) {
					id
					name
					amount {
						amountMicros
						currencyCode
					}
					closeDate
					stage
					position
					createdBy {
						source
						name
					}
					createdAt
					updatedAt
					company {
						id
						name
					}
					pointOfContact {
						id
						name {
							firstName
							lastName
						}
					}
				}
			}
		`;

		const createData: IDataObject = {};

		// Required fields
		if (opportunityData.name) createData.name = opportunityData.name;

		// Optional fields
		if (opportunityData.amount) createData.amount = opportunityData.amount;
		if (opportunityData.closeDate) createData.closeDate = opportunityData.closeDate;
		if (opportunityData.stage) createData.stage = opportunityData.stage;
		if (opportunityData.position !== undefined) createData.position = opportunityData.position;
		
		// Relations
		if (opportunityData.companyId) createData.companyId = opportunityData.companyId;
		if (opportunityData.pointOfContactId) createData.pointOfContactId = opportunityData.pointOfContactId;

		const variables = { data: createData };
		const response = await twentyGraphQLRequest.call(this, mutation, variables);

		if (!response.data?.createOpportunity) {
			throw new NodeOperationError(
				this.getNode(),
				'Failed to create opportunity - no data returned'
			);
		}

		return {
			created: true,
			action: 'created_new',
			opportunity: response.data.createOpportunity,
			confidence: 1.0,
		};

	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to find or create opportunity: ${error.message}`
		);
	}
}

export async function updateOpportunityGraphQL(
	this: IExecuteFunctions,
	opportunityId: string,
	updateData: IDataObject
): Promise<{
	updated: boolean;
	opportunity: any;
	error?: string;
}> {
	try {
		const mutation = `
			mutation UpdateOpportunity($idToUpdate: UUID!, $input: OpportunityUpdateInput!) {
				updateOpportunity(id: $idToUpdate, data: $input) {
					id
					name
					amount {
						amountMicros
						currencyCode
					}
					closeDate
					stage
					position
					createdBy {
						source
						name
					}
					createdAt
					updatedAt
					company {
						id
						name
					}
					pointOfContact {
						id
						name {
							firstName
							lastName
						}
					}
				}
			}
		`;

		const variables = { idToUpdate: opportunityId, input: updateData };
		const response = await twentyGraphQLRequest.call(this, mutation, variables);

		if (!response.data?.updateOpportunity) {
			return {
				updated: false,
				opportunity: null,
				error: 'No data returned from update operation',
			};
		}

		return {
			updated: true,
			opportunity: response.data.updateOpportunity,
		};

	} catch (error) {
		return {
			updated: false,
			opportunity: null,
			error: error.message,
		};
	}
}

export async function deleteOpportunityGraphQL(
	this: IExecuteFunctions,
	opportunityId: string
): Promise<{
	deleted: boolean;
	opportunityId: string;
	error?: string;
}> {
	try {
		const mutation = `
			mutation DeleteOpportunity($idToDelete: UUID!) {
				deleteOpportunity(id: $idToDelete) {
					id
				}
			}
		`;

		const variables = { idToDelete: opportunityId };
		const response = await twentyGraphQLRequest.call(this, mutation, variables);

		if (!response.data?.deleteOpportunity) {
			return {
				deleted: false,
				opportunityId,
				error: 'No confirmation returned from delete operation',
			};
		}

		return {
			deleted: true,
			opportunityId: response.data.deleteOpportunity.id,
		};

	} catch (error) {
		return {
			deleted: false,
			opportunityId,
			error: error.message,
		};
	}
}

export async function listOpportunitiesGraphQL(
	this: IExecuteFunctions,
	filters?: IDataObject,
	limit?: number,
	orderBy?: string
): Promise<{
	opportunities: any[];
	totalCount: number;
	hasNextPage: boolean;
}> {
	try {

		const query = `
			query ListOpportunities($filter: OpportunityFilterInput, $orderBy: [OpportunityOrderByInput], $first: Int) {
				opportunities(filter: $filter, orderBy: $orderBy, first: $first) {
					edges {
						node {
							id
							name
							amount {
								amountMicros
								currencyCode
							}
							closeDate
							stage
							position
							createdBy {
								source
								name
							}
							createdAt
							updatedAt
							company {
								id
								name
								domainName {
									primaryLinkUrl
								}
							}
							pointOfContact {
								id
								name {
									firstName
									lastName
								}
								emails {
									primaryEmail
								}
							}
						}
						cursor
					}
					pageInfo {
						hasNextPage
						hasPreviousPage
						startCursor
						endCursor
					}
					totalCount
				}
			}
		`;

		// Build variables object
		const variables: any = {
			first: limit || 50,
		};

		if (filters) {
			const filterObj: any = {};
			if (filters.stage) filterObj.stage = { eq: filters.stage };
			if (filters.companyId) filterObj.companyId = { eq: filters.companyId };
			if (filters.pointOfContactId) filterObj.pointOfContactId = { eq: filters.pointOfContactId };
			if (filters.searchTerm) filterObj.name = { ilike: `%${filters.searchTerm}%` };
			
			if (Object.keys(filterObj).length > 0) {
				variables.filter = filterObj;
			}
		}

		if (orderBy) {
			const [field, direction] = orderBy.split(':');
			const directionMapping: { [key: string]: string } = {
				'ASC': 'AscNullsFirst',
				'DESC': 'DescNullsLast'
			};
			const mappedDirection = directionMapping[direction?.toUpperCase() || 'ASC'] || 'AscNullsFirst';
			variables.orderBy = [{ [field]: mappedDirection }];
		}

		const response = await twentyGraphQLRequest.call(this, query, variables);
		const data = response.data?.opportunities;

		if (!data) {
			return {
				opportunities: [],
				totalCount: 0,
				hasNextPage: false,
			};
		}

		return {
			opportunities: data.edges.map((edge: any) => edge.node),
			totalCount: data.totalCount,
			hasNextPage: data.pageInfo.hasNextPage,
		};

	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to list opportunities: ${error.message}`
		);
	}
}

// ============================================================================
// DELETE OPERATIONS - GraphQL
// ============================================================================

export async function deletePersonGraphQL(
	this: IExecuteFunctions,
	personId: string
): Promise<{
	deleted: boolean;
	personId: string;
	error?: string;
}> {
	try {
		if (!isValidTwentyUuid(personId)) {
			return {
				deleted: false,
				personId,
				error: 'Invalid person ID format. Must be a valid UUID.',
			};
		}

		const mutation = `
			mutation DeletePerson($idToDelete: UUID!) {
				deletePerson(id: $idToDelete) {
					id
				}
			}
		`;

		const variables = { idToDelete: personId };
		const response = await twentyGraphQLRequest.call(this, mutation, variables);

		if (!response.data?.deletePerson) {
			return {
				deleted: false,
				personId,
				error: 'No confirmation returned from delete operation',
			};
		}

		return {
			deleted: true,
			personId: response.data.deletePerson.id,
		};

	} catch (error) {
		return {
			deleted: false,
			personId,
			error: error.message,
		};
	}
}

export async function deleteCompanyGraphQL(
	this: IExecuteFunctions,
	companyId: string
): Promise<{
	deleted: boolean;
	companyId: string;
	error?: string;
}> {
	try {
		if (!isValidTwentyUuid(companyId)) {
			return {
				deleted: false,
				companyId,
				error: 'Invalid company ID format. Must be a valid UUID.',
			};
		}

		const mutation = `
			mutation DeleteCompany($idToDelete: UUID!) {
				deleteCompany(id: $idToDelete) {
					id
				}
			}
		`;

		const variables = { idToDelete: companyId };
		const response = await twentyGraphQLRequest.call(this, mutation, variables);

		if (!response.data?.deleteCompany) {
			return {
				deleted: false,
				companyId,
				error: 'No confirmation returned from delete operation',
			};
		}

		return {
			deleted: true,
			companyId: response.data.deleteCompany.id,
		};

	} catch (error) {
		return {
			deleted: false,
			companyId,
			error: error.message,
		};
	}
}

// ============================================================================
// UPDATE OPERATIONS - GraphQL
// ============================================================================

export async function updateCompanyGraphQL(
	this: IExecuteFunctions,
	companyId: string,
	updateData: IDataObject
): Promise<{
	updated: boolean;
	company: any;
	error?: string;
}> {
	try {
		if (!isValidTwentyUuid(companyId)) {
			return {
				updated: false,
				company: null,
				error: 'Invalid company ID format. Must be a valid UUID.',
			};
		}

		const mutation = `
			mutation UpdateCompany($idToUpdate: UUID!, $input: CompanyUpdateInput!) {
				updateCompany(id: $idToUpdate, data: $input) {
					id
					name
					domainName {
						primaryLinkUrl
					}
					employees
					address {
						addressStreet1
						addressStreet2
						addressCity
						addressPostcode
						addressState
						addressCountry
					}
					annualRecurringRevenue {
						amountMicros
						currencyCode
					}
					linkedinLink {
						primaryLinkUrl
					}
					xLink {
						primaryLinkUrl
					}
					accountOwnerId
					accountOwner {
						id
						name {
							firstName
							lastName
						}
					}
					createdAt
					updatedAt
				}
			}
		`;

		const variables = { idToUpdate: companyId, input: updateData };
		const response = await twentyGraphQLRequest.call(this, mutation, variables);

		if (!response.data?.updateCompany) {
			return {
				updated: false,
				company: null,
				error: 'No data returned from update operation',
			};
		}

		return {
			updated: true,
			company: response.data.updateCompany,
		};

	} catch (error) {
		return {
			updated: false,
			company: null,
			error: error.message,
		};
	}
}

// ============================================================================
// UNIFIED PERSON UPDATE FUNCTION
// ============================================================================

export async function updatePersonUnifiedGraphQL(
	this: IExecuteFunctions,
	searchBy: string,
	searchValue: string,
	updateData: IDataObject
): Promise<{
	updated: boolean;
	person: any;
	originalPerson?: any;
	error?: string;
}> {
	try {
		// First find the person using unified search
		const findResult = await findPersonUnifiedGraphQL.call(this, searchBy, searchValue, undefined, false);
		if (!findResult.found) {
			return {
				updated: false,
				person: null,
				error: 'Person not found',
			};
		}

		const personId = findResult.person.id;

		// Build update data structure for GraphQL
		const processedData: IDataObject = {};

		if (updateData.name || updateData.firstName || updateData.lastName) {
			const updateNameData = updateData.name as IDataObject;
			const personNameData = findResult.person.name as IDataObject;
			processedData.name = {
				firstName: updateData.firstName || updateNameData?.firstName || personNameData?.firstName || '',
				lastName: updateData.lastName || updateNameData?.lastName || personNameData?.lastName || ''
			};
		}

		if (updateData.emails || updateData.email) {
			const emailsData = updateData.emails as IDataObject;
			processedData.emails = {
				primaryEmail: updateData.email || emailsData?.primaryEmail
			};
		}

		if (updateData.phones || updateData.phone) {
			const phonesData = updateData.phones as IDataObject;
			processedData.phones = {
				primaryPhoneNumber: updateData.phone || phonesData?.primaryPhoneNumber || '',
				primaryPhoneCountryCode: updateData.phoneCountryCode || phonesData?.primaryPhoneCountryCode || '',
				primaryPhoneCallingCode: updateData.phoneCallingCode || phonesData?.primaryPhoneCallingCode || ''
			};
		}

		if (updateData.jobTitle !== undefined) processedData.jobTitle = updateData.jobTitle;
		if (updateData.city !== undefined) processedData.city = updateData.city;
		if (updateData.avatarUrl !== undefined) processedData.avatarUrl = updateData.avatarUrl;
		if (updateData.position !== undefined) processedData.position = updateData.position;
		if (updateData.companyId !== undefined) processedData.companyId = updateData.companyId;

		if (updateData.linkedinUrl || updateData.linkedinLink) {
			const linkedinData = updateData.linkedinLink as IDataObject;
			processedData.linkedinLink = {
				primaryLinkUrl: updateData.linkedinUrl || linkedinData?.primaryLinkUrl
			};
		}

		if (updateData.xUrl || updateData.xLink) {
			const xData = updateData.xLink as IDataObject;
			processedData.xLink = {
				primaryLinkUrl: updateData.xUrl || xData?.primaryLinkUrl
			};
		}

		// GraphQL mutation to update person
		const mutation = `
			mutation UpdatePerson($id: UUID!, $data: PersonUpdateInput!) {
				updatePerson(id: $id, data: $data) {
					id
					name {
						firstName
						lastName
					}
					emails {
						primaryEmail
					}
					phones {
						primaryPhoneNumber
						primaryPhoneCountryCode
						primaryPhoneCallingCode
					}
					jobTitle
					city
					avatarUrl
					linkedinLink {
						primaryLinkUrl
					}
					xLink {
						primaryLinkUrl
					}
					company {
						id
						name
						domainName {
							primaryLinkUrl
						}
					}
				}
			}
		`;

		const response = await twentyGraphQLRequest.call(this, mutation, { 
			id: personId, 
			data: processedData 
		});
		const updatedPerson = response.data?.updatePerson;

		return {
			updated: true,
			person: updatedPerson,
			originalPerson: findResult.person,
		};

	} catch (error) {
		return {
			updated: false,
			person: null,
			error: error.message,
		};
	}
}

// ============================================================================
// WORKSPACE MEMBER LOOKUP FUNCTIONS
// ============================================================================

export async function findWorkspaceMemberByEmailGraphQL(
	this: IExecuteFunctions,
	email: string
): Promise<{
	found: boolean;
	workspaceMember: any;
	error?: string;
}> {
	try {
		const query = `
			query FindWorkspaceMemberByEmail($filter: WorkspaceMemberFilterInput) {
				workspaceMembers(filter: $filter) {
					edges {
						node {
							id
							name {
								firstName
								lastName
							}
						}
					}
				}
			}
		`;

		const variables = {
			filter: {
				userEmail: { eq: email }
			}
		};

		const response = await twentyGraphQLRequest.call(this, query, variables);
		const edges = response.data?.workspaceMembers?.edges || [];

		if (edges.length === 0) {
			return {
				found: false,
				workspaceMember: null,
				error: `No workspace member found with email: ${email}. Make sure the email exists in the workspace and is correctly spelled.`
			};
		}

		return {
			found: true,
			workspaceMember: edges[0].node
		};

	} catch (error) {
		return {
			found: false,
			workspaceMember: null,
			error: `Failed to find workspace member with email ${email}: ${error.message}`
		};
	}
}
