import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IRequestOptions,
	IHttpRequestMethods,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
// Simple UUID v4 generator without requiring crypto module

export async function twentyApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	path: string = '/rest',
) {
	const credentials = await this.getCredentials('twentyApi');

	if (credentials === undefined) {
		throw new NodeOperationError(this.getNode(), 'No credentials returned!');
	}

	// Validate and prepare request body for UUID fields
	let processedBody = body;
	if (Object.keys(body).length > 0) {
		try {
			const requireId = method === 'POST'; // CREATE operations need ID
			processedBody = prepareRequestBody(body, requireId);
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Request validation failed: ${error.message}`);
		}
	}

	// Validate UUID in endpoint path if present
	const uuidMatch = endpoint.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
	if (uuidMatch && !isValidTwentyUuid(uuidMatch[1])) {
		throw new NodeOperationError(
			this.getNode(), 
			`Invalid UUID in path: "${uuidMatch[1]}". Must be a valid UUID format.`
		);
	}

	const options: IRequestOptions = {
		method,
		body: processedBody,
		qs,
		uri: `${credentials.domain}${path}${endpoint}`,
		json: true,
	};

	if (!Object.keys(processedBody).length) {
		delete options.body;
	}

	if (!Object.keys(qs).length) {
		delete options.qs;
	}

	try {
		return await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
	} catch (error) {
		// Enhance error messages for better UX
		let errorMessage = 'Twenty API request failed';
		if (error.response?.data?.message) {
			errorMessage = `Twenty API Error: ${error.response.data.message}`;
		} else if (error.message) {
			errorMessage = `Twenty API Error: ${error.message}`;
		}
		
		throw new NodeApiError(this.getNode(), error, { message: errorMessage });
	}
}

export async function twentyApiMetadataRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
	const credentials = await this.getCredentials('twentyApi');

	if (credentials === undefined) {
		throw new NodeOperationError(this.getNode(), 'No credentials returned!');
	}

	const options: IRequestOptions = {
		method,
		body,
		qs,
		uri: `${credentials.domain}/rest/metadata${endpoint}`,
		json: true,
	};

	if (!Object.keys(body).length) {
		delete options.body;
	}

	if (!Object.keys(qs).length) {
		delete options.qs;
	}

	try {
		return await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

// UUID Helper Functions - Using Twenty's exact validation logic
export function isValidTwentyUuid(value: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
}

export function generateTwentyUuid(): string {
	// Generate a simple UUID v4 without crypto dependency
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

export function validateAndFormatUuid(value: string | undefined, fieldName: string): string {
	if (!value) {
		return generateTwentyUuid();
	}
	
	if (!isValidTwentyUuid(value)) {
		throw new NodeOperationError(
			undefined as any,
			`Invalid UUID format for ${fieldName}: "${value}". Must be a valid UUID (e.g., "123e4567-e89b-12d3-a456-426614174000")`
		);
	}
	
	return value;
}

export function prepareRequestBody(body: IDataObject, requireId: boolean = false): IDataObject {
	const preparedBody: IDataObject = { ...body };
	
	if (requireId || preparedBody.id !== undefined) {
		preparedBody.id = validateAndFormatUuid(preparedBody.id as string, 'id');
	}
	
	// Validate common UUID fields that Twenty uses
	const uuidFields = ['companyId', 'personId', 'opportunityId', 'accountOwnerId', 'workspaceMemberId', 'authorId'];
	
	uuidFields.forEach(field => {
		if (preparedBody[field] !== undefined) {
			preparedBody[field] = validateAndFormatUuid(preparedBody[field] as string, field);
		}
	});
	
	return preparedBody;
}

// Load Options Methods for Dropdowns  
export async function loadCompanies(this: ILoadOptionsFunctions) {
	try {
		const credentials = await this.getCredentials('twentyApi');
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials returned!');
		}
		
		const options: IRequestOptions = {
			method: 'GET',
			uri: `${credentials.domain}/rest/companies`,
			qs: { first: 100 },
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		const companies = response.data?.companies || [];
		
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
		
		const options: IRequestOptions = {
			method: 'GET',
			uri: `${credentials.domain}/rest/people`,
			qs: { first: 100 },
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		const people = response.data?.people || [];
		
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
		
		const options: IRequestOptions = {
			method: 'GET',
			uri: `${credentials.domain}/rest/opportunities`,
			qs: { first: 100 },
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		const opportunities = response.data?.opportunities || [];
		
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
		
		const options: IRequestOptions = {
			method: 'GET',
			uri: `${credentials.domain}/rest/notes`,
			qs: { first: 100 },
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		const notes = response.data?.notes || [];
		
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
		
		const options: IRequestOptions = {
			method: 'GET',
			uri: `${credentials.domain}/rest/tasks`,
			qs: { first: 100 },
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		const tasks = response.data?.tasks || [];
		
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
		
		const options: IRequestOptions = {
			method: 'GET',
			uri: `${credentials.domain}/rest/messageThreads`,
			qs: { first: 100 },
			json: true,
		};
		
		const response = await this.helpers.requestWithAuthentication.call(this, 'twentyApi', options);
		const messageThreads = response.data?.messageThreads || [];
		
		return messageThreads.map((thread: any) => ({
			name: `Thread ${thread.id.slice(0, 8)}`,
			value: thread.id,
		}));
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to load message threads: ${error.message}`);
	}
}

// Smart Search Functions for use case oriented operations

export async function findPersonByEmail(
	this: IExecuteFunctions,
	email: string,
	includeCompany: boolean = true
) {
	try {
		// Validate email format first
		if (!isValidEmail(email)) {
			return {
				found: false,
				person: null,
				confidence: 0,
				error: 'Invalid email format',
			};
		}

		// Use correct Twenty CRM GraphQL filter syntax
		const qs: IDataObject = {
			filter: { 
				emails: { 
					primaryEmail: { 
						eq: email.toLowerCase().trim() 
					} 
				} 
			},
		};
		
		if (includeCompany) {
			qs.depth = 1;
		}
		
		const response = await twentyApiRequest.call(this, 'GET', '/people', {}, qs);
		const people = response.data?.people || [];
		
		if (people.length === 0) {
			return {
				found: false,
				person: null,
				confidence: 0,
			};
		}
		
		// Verify exact match (double-check the result)
		const exactMatch = people.find((person: any) => 
			person.emails?.primaryEmail?.toLowerCase().trim() === email.toLowerCase().trim()
		);
		
		if (!exactMatch) {
			return {
				found: false,
				person: null,
				confidence: 0,
			};
		}
		
		return {
			found: true,
			person: exactMatch,
			confidence: 1.0,
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to find person by email: ${error.message}`
		);
	}
}

export async function findCompanyByName(
	this: IExecuteFunctions,
	name: string,
	includePeople: boolean = true
) {
	try {
		// Validate input
		const trimmedName = name?.trim();
		if (!trimmedName) {
			return {
				found: false,
				company: null,
				confidence: 0,
				error: 'Company name cannot be empty',
			};
		}

		// Try exact match first (case-insensitive)
		let qs: IDataObject = {
			filter: { 
				name: { 
					eq: trimmedName 
				} 
			},
		};
		
		if (includePeople) {
			qs.depth = 1;
		}
		
		let response = await twentyApiRequest.call(this, 'GET', '/companies', {}, qs);
		let companies = response.data?.companies || [];
		
		// If no exact match, try case-insensitive exact match
		if (companies.length === 0) {
			qs = {
				filter: { 
					name: { 
						ilike: trimmedName  // Exact match without wildcards
					} 
				},
			};
			
			if (includePeople) {
				qs.depth = 1;
			}
			
			response = await twentyApiRequest.call(this, 'GET', '/companies', {}, qs);
			companies = response.data?.companies || [];
		}
		
		if (companies.length === 0) {
			return {
				found: false,
				company: null,
				confidence: 0,
			};
		}
		
		// Find exact match (double-check the result)
		const exactMatch = companies.find((company: any) => 
			company.name?.toLowerCase().trim() === trimmedName.toLowerCase()
		);
		
		if (!exactMatch) {
			return {
				found: false,
				company: null,
				confidence: 0,
			};
		}
		
		return {
			found: true,
			company: exactMatch,
			confidence: 1.0,
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to find company by name: ${error.message}`
		);
	}
}

export async function findCompanyByDomain(
	this: IExecuteFunctions,
	domain: string,
	includePeople: boolean = true
) {
	try {
		// Normalize domain
		const normalizedDomain = normalizeDomain(domain);
		if (!normalizedDomain) {
			return {
				found: false,
				company: null,
				confidence: 0,
				error: 'Invalid domain format',
			};
		}

		// Use correct Twenty CRM GraphQL filter syntax for exact match
		const qs: IDataObject = {
			filter: { 
				domainName: { 
					primaryLinkUrl: { 
						eq: normalizedDomain 
					} 
				} 
			},
		};
		
		if (includePeople) {
			qs.depth = 1;
		}
		
		const response = await twentyApiRequest.call(this, 'GET', '/companies', {}, qs);
		const companies = response.data?.companies || [];
		
		if (companies.length === 0) {
			return {
				found: false,
				company: null,
				confidence: 0,
			};
		}
		
		// Verify exact match (double-check the result)
		const exactMatch = companies.find((company: any) => {
			const companyDomain = normalizeDomain(company.domainName?.primaryLinkUrl || '');
			return companyDomain === normalizedDomain;
		});
		
		if (!exactMatch) {
			return {
				found: false,
				company: null,
				confidence: 0,
			};
		}
		
		return {
			found: true,
			company: exactMatch,
			confidence: 1.0,
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to find company by domain: ${error.message}`
		);
	}
}

export async function getPersonFullProfile(
	this: IExecuteFunctions,
	personId: string
) {
	try {
		const qs: IDataObject = {
			depth: 2, // Include company and other relationships
		};
		
		const response = await twentyApiRequest.call(this, 'GET', `/people/${personId}`, {}, qs);
		const person = response.data?.person;
		
		if (!person) {
			return {
				found: false,
				person: null,
			};
		}
		
		return {
			found: true,
			person,
			profile: {
				basicInfo: {
					name: person.name,
					email: person.emails?.primaryEmail,
					phone: person.phone?.primaryPhoneNumber,
					city: person.city,
					position: person.position,
				},
				company: person.company ? {
					name: person.company.name,
					domain: person.company.domainName?.primaryLinkUrl,
					address: person.company.address,
				} : null,
				relationships: {
					opportunities: person.opportunities || [],
					activities: person.activities || [],
					tasks: person.tasks || [],
				}
			}
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to get person full profile: ${error.message}`
		);
	}
}

export async function getCompanyIntelligence(
	this: IExecuteFunctions,
	companyId: string
) {
	try {
		const qs: IDataObject = {
			depth: 2, // Include people, opportunities, etc.
		};
		
		const response = await twentyApiRequest.call(this, 'GET', `/companies/${companyId}`, {}, qs);
		const company = response.data?.company;
		
		if (!company) {
			return {
				found: false,
				company: null,
			};
		}
		
		// Build intelligence summary
		const people = company.people || [];
		const opportunities = company.opportunities || [];
		
		return {
			found: true,
			company,
			intelligence: {
				basicInfo: {
					name: company.name,
					domain: company.domainName?.primaryLinkUrl,
					address: company.address,
					employees: company.employees,
					annualRecurringRevenue: company.annualRecurringRevenue,
				},
				teamInfo: {
					totalPeople: people.length,
					keyContacts: people.slice(0, 5).map((person: any) => ({
						name: person.name,
						email: person.emails?.primaryEmail,
						position: person.position,
					})),
				},
				salesInfo: {
					totalOpportunities: opportunities.length,
					activeOpportunities: opportunities.filter((opp: any) => 
						opp.stage && !['CLOSED_WON', 'CLOSED_LOST'].includes(opp.stage)
					).length,
					totalValue: opportunities.reduce((sum: number, opp: any) => 
						sum + (opp.amount?.amountMicros || 0), 0
					) / 1000000, // Convert from micros
				},
				lastActivity: company.updatedAt,
			}
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to get company intelligence: ${error.message}`
		);
	}
}

// Find or Create Operations - Core workflow patterns

export async function findOrCreateContact(
	this: IExecuteFunctions,
	contactData: IDataObject
) {
	try {
		const email = contactData.email as string;
		
		// First, try to find existing contact
		if (email) {
			const existingResult = await findPersonByEmail.call(this, email, true);
			if (existingResult.found) {
				return {
					action: 'found',
					person: existingResult.person,
					confidence: existingResult.confidence,
					created: false,
				};
			}
		}
		
		// Not found, create new contact
		const createData = prepareRequestBody({
			id: generateTwentyUuid(),
			name: contactData.name || {},
			emails: contactData.emails || (contactData.email ? { primaryEmail: contactData.email } : undefined),
			phones: contactData.phones || (contactData.phone ? { primaryPhoneNumber: contactData.phone } : undefined),
			jobTitle: contactData.jobTitle,
			city: contactData.city,
			avatarUrl: contactData.avatarUrl,
			position: contactData.position,
			companyId: contactData.companyId,
			linkedinLink: contactData.linkedinLink,
			xLink: contactData.xLink,
		}, true);
		
		const response = await twentyApiRequest.call(this, 'POST', '/people', createData);
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

export async function findOrCreateCompany(
	this: IExecuteFunctions,
	companyData: IDataObject
) {
	try {
		const name = companyData.name as string;
		const domain = companyData.domain as string;
		
		// First, try to find existing company by domain (more reliable)
		if (domain) {
			const existingByDomain = await findCompanyByDomain.call(this, domain, false);
			if (existingByDomain.found && existingByDomain.confidence >= 1.0) {
				return {
					action: 'found',
					company: existingByDomain.company,
					confidence: existingByDomain.confidence,
					created: false,
					foundBy: 'domain',
				};
			}
		}
		
		// If not found by domain, try by name
		if (name) {
			const existingByName = await findCompanyByName.call(this, name, false);
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
		
		// Not found, create new company
		const createData = prepareRequestBody({
			id: generateTwentyUuid(),
			name: companyData.name,
			domainName: companyData.domainName || (domain ? { primaryLinkUrl: domain.startsWith('http') ? domain : `https://${domain}` } : undefined),
			address: companyData.address,
			employees: companyData.employees,
			annualRecurringRevenue: companyData.annualRecurringRevenue,
			linkedinLink: companyData.linkedinLink,
			xLink: companyData.xLink,
		}, true);
		
		const response = await twentyApiRequest.call(this, 'POST', '/companies', createData);
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

// Update Operations by Natural Identifiers

export async function updateContactByEmail(
	this: IExecuteFunctions,
	email: string,
	updateData: IDataObject
) {
	try {
		// Find the contact first
		const findResult = await findPersonByEmail.call(this, email, false);
		if (!findResult.found) {
			return {
				updated: false,
				error: 'Contact not found',
				person: null,
			};
		}
		
		const personId = findResult.person.id;
		const processedData = prepareRequestBody(updateData);
		
		const response = await twentyApiRequest.call(this, 'PUT', `/people/${personId}`, processedData);
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

export async function updateCompanyByName(
	this: IExecuteFunctions,
	name: string,
	updateData: IDataObject
) {
	try {
		// Find the company first
		const findResult = await findCompanyByName.call(this, name, false);
		if (!findResult.found || findResult.confidence < 1.0) {
			return {
				updated: false,
				error: findResult.found ? 'No exact match found, update cancelled' : 'Company not found',
				company: null,
			};
		}
		
		const companyId = findResult.company.id;
		const processedData = prepareRequestBody(updateData);
		
		const response = await twentyApiRequest.call(this, 'PUT', `/companies/${companyId}`, processedData);
		const updatedCompany = response.data?.updateCompany;
		
		return {
			updated: true,
			company: updatedCompany,
			originalCompany: findResult.company,
			confidence: findResult.confidence,
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to update company by name: ${error.message}`
		);
	}
}

// Advanced sync operation for keeping data updated
export async function syncContactData(
	this: IExecuteFunctions,
	email: string,
	externalData: IDataObject
) {
	try {
		// Find existing contact
		const findResult = await findPersonByEmail.call(this, email, true);
		
		if (!findResult.found) {
			// Create new contact if not found
			const createResult = await findOrCreateContact.call(this, {
				email,
				...externalData,
			});
			return {
				action: 'created',
				person: createResult.person,
				changes: Object.keys(externalData),
			};
		}
		
		// Compare and identify changes
		const person = findResult.person;
		const changes: string[] = [];
		const updateData: IDataObject = {};
		
		// Compare basic fields
		const fieldsToCompare = ['city', 'position'];
		fieldsToCompare.forEach(field => {
			if (externalData[field] && externalData[field] !== person[field]) {
				updateData[field] = externalData[field];
				changes.push(field);
			}
		});
		
		// Compare nested fields (name, phone)
		if (externalData.firstName || externalData.lastName) {
			const currentFirstName = person.name?.firstName || '';
			const currentLastName = person.name?.lastName || '';
			const newFirstName = externalData.firstName as string || currentFirstName;
			const newLastName = externalData.lastName as string || currentLastName;
			
			if (newFirstName !== currentFirstName || newLastName !== currentLastName) {
				updateData.name = { firstName: newFirstName, lastName: newLastName };
				changes.push('name');
			}
		}
		
		if (externalData.phone) {
			const currentPhone = person.phone?.primaryPhoneNumber || '';
			if (externalData.phone !== currentPhone) {
				updateData.phone = { primaryPhoneNumber: externalData.phone };
				changes.push('phone');
			}
		}
		
		// If no changes, return current data
		if (changes.length === 0) {
			return {
				action: 'no_changes',
				person,
				changes: [],
			};
		}
		
		// Update with changes
		const updateResult = await updateContactByEmail.call(this, email, updateData);
		return {
			action: 'updated',
			person: updateResult.person,
			changes,
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to sync contact data: ${error.message}`
		);
	}
}

// Input validation functions
function isValidEmail(email: string): boolean {
	if (!email || typeof email !== 'string') return false;
	
	const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	return emailRegex.test(email.trim());
}

function normalizeDomain(domain: string): string | null {
	if (!domain || typeof domain !== 'string') return null;
	
	let normalized = domain.trim().toLowerCase();
	
	// Remove protocol
	normalized = normalized.replace(/^https?:\/\//, '');
	
	// Remove www.
	normalized = normalized.replace(/^www\./, '');
	
	// Remove trailing slash and path
	normalized = normalized.split('/')[0];
	
	// Basic domain validation
	const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	
	if (!domainRegex.test(normalized)) return null;
	
	return normalized;
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
		// Get field metadata for the object
		const objectName = objectType === 'person' ? 'person' : 'company';
		const metadata = await twentyApiMetadataRequest.call(
			this,
			'GET',
			`/fields`,
			{},
			{ filter: `object.nameSingular[eq]:"${objectName}"` }
		);
		
		if (!metadata?.data) {
			return {
				resolvedField: null,
				fieldExists: false,
				triedFields: uniqueCandidates
			};
		}
		
		const availableFields = metadata.data.map((field: any) => field.name);
		
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
		// Fallback: try the field name directly if metadata API fails
		// Use the first candidate (exact field name) as fallback
		const fallbackField = uniqueCandidates[0];
		
		return {
			resolvedField: fallbackField,
			fieldExists: false, // We couldn't validate but we're trying anyway
			triedFields: uniqueCandidates,
			fallbackUsed: true
		};
	}
}

// Unified person search function
export async function findPersonUnified(
	this: IExecuteFunctions,
	searchBy: string,
	searchValue: string,
	customFieldName?: string,
	includeRelated: boolean = true
) {
	try {
		
		const endpoint = '/people';
		const qs: IDataObject = {
			limit: 50
		};
		
		// Convert complex filter to REST API format
		let filterString = '';
		
		switch (searchBy) {
			case 'email':
				filterString = `emails.primaryEmail[eq]:"${searchValue.toLowerCase()}"`;
				break;
			case 'phone':
				filterString = `phones.primaryPhoneNumber[eq]:"${searchValue}"`;
				break;
			case 'name':
				// For name searches, use firstName or lastName with ilike
				filterString = `or(name.firstName[ilike]:"%${searchValue}%",name.lastName[ilike]:"%${searchValue}%")`;
				break;
			case 'customField':
				if (!customFieldName) {
					throw new NodeOperationError(
						this.getNode(),
						'Custom field name is required when searching by custom field'
					);
				}
				
				// Resolve field name with fallback
				const fieldResolution = await resolveFieldName.call(this, 'person', customFieldName);
				
				if (!fieldResolution.fieldExists && !fieldResolution.fallbackUsed) {
					throw new NodeOperationError(
						this.getNode(),
						`Field "${customFieldName}" not found. Tried: ${fieldResolution.triedFields.join(', ')}.`
					);
				}
				
				const resolvedField = fieldResolution.resolvedField!;
				
				if (resolvedField.includes('Link')) {
					filterString = `${resolvedField}.primaryLinkUrl[eq]:"${searchValue}"`;
				} else {
					filterString = `${resolvedField}[contains]:"${searchValue}"`;
				}
				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unsupported search method: ${searchBy}`
				);
		}
		
		if (filterString) {
			qs.filter = filterString;
		}
		
		const response = await twentyApiRequest.call(this, 'GET', endpoint, {}, qs);
		
		const people = response.data?.people || [];
		
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

// Unified company search function
export async function findCompanyUnified(
	this: IExecuteFunctions,
	searchBy: string,
	searchValue: string,
	customFieldName?: string,
	includeRelated: boolean = true
) {
	try {
		
		const endpoint = '/companies';
		const qs: IDataObject = {
			limit: 50
		};
		
		// Convert complex filter to REST API format
		let filterString = '';
		
		switch (searchBy) {
			case 'name':
				filterString = `name[ilike]:"%${searchValue}%"`;
				break;
				
			case 'domain':
				const normalizedDomain = normalizeDomain(searchValue);
				if (!normalizedDomain) {
					throw new NodeOperationError(
						this.getNode(),
						'Invalid domain format'
					);
				}
				filterString = `domainName.primaryLinkUrl[eq]:"${normalizedDomain}"`;
				break;
				
			case 'customField':
				if (!customFieldName) {
					throw new NodeOperationError(
						this.getNode(),
						'Custom field name is required when searching by custom field'
					);
				}
				
				// Resolve field name with fallback
				const fieldResolution = await resolveFieldName.call(this, 'company', customFieldName);
				
				if (!fieldResolution.fieldExists && !fieldResolution.fallbackUsed) {
					throw new NodeOperationError(
						this.getNode(),
						`Field "${customFieldName}" not found. Tried: ${fieldResolution.triedFields.join(', ')}.`
					);
				}
				
				const resolvedField = fieldResolution.resolvedField!;
				
				if (resolvedField.includes('Link')) {
					filterString = `${resolvedField}.primaryLinkUrl[eq]:"${searchValue}"`;
				} else {
					filterString = `${resolvedField}[contains]:"${searchValue}"`;
				}
				break;
				
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unsupported search method: ${searchBy}`
				);
		}
		
		if (filterString) {
			qs.filter = filterString;
		}
		
		const response = await twentyApiRequest.call(this, 'GET', endpoint, {}, qs);
		
		const companies = response.data?.companies || [];
		
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

// List people by company
export async function listPersonsByCompany(
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
		
		const endpoint = '/people';
		const qs: IDataObject = {
			filter: `companyId[eq]:"${companyId}"`,
			limit: 100 // Allow more results for company listings
		};
		
		const response = await twentyApiRequest.call(this, 'GET', endpoint, {}, qs);
		
		const people = response.data?.people || [];
		
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
