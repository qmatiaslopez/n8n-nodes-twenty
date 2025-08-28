import { IExecuteFunctions, IDataObject, NodeOperationError } from 'n8n-workflow';
import {
	findPersonUnifiedGraphQL,
	findOrCreateContactGraphQL,
	deletePersonGraphQL,
	updateContactByEmailGraphQL,
	updatePersonUnifiedGraphQL,
	listPersonsByCompanyGraphQL,
	findCompanyUnifiedGraphQL,
	resolveFieldName,
} from '../GenericFunctions';

export class PersonOperations {
	/**
	 * Find person by email, phone, or LinkedIn
	 */
	static async findPerson(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const searchBy = context.getNodeParameter('searchBy', i) as string;
		const searchValue = context.getNodeParameter('searchValue', i) as string;

		const result = await findPersonUnifiedGraphQL.call(
			context,
			searchBy,
			searchValue,
			undefined,
			true
		);

		return {
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
	}

	/**
	 * Create a new person
	 */
	static async createPerson(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const additionalFields = context.getNodeParameter('additionalFields', i, {}) as any;

		if (!additionalFields.firstName) {
			throw new NodeOperationError(
				context.getNode(),
				'First Name is required for creating a person. Please provide it in Additional Fields.'
			);
		}

		const personData: IDataObject = {
			name: { firstName: additionalFields.firstName, lastName: additionalFields.lastName || '' },
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

		const result = await findOrCreateContactGraphQL.call(context, personData);

		return {
			created: result.created,
			action: result.action,
			person: result.person,
			confidence: result.confidence,
			recordId: result.person?.id,
			message: result.created
				? `Person created: ${additionalFields.firstName} ${additionalFields.lastName || ''}`
				: `Person already exists: ${additionalFields.firstName} ${additionalFields.lastName || ''}`,
		};
	}

	/**
	 * Update an existing person
	 */
	static async updatePerson(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const searchBy = context.getNodeParameter('updateSearchBy', i) as string;
		const searchValue = context.getNodeParameter('updateSearchValue', i) as string;
		const additionalFields = context.getNodeParameter('additionalFields', i, {}) as any;
		const customFields = context.getNodeParameter('customFields', i, {}) as any;

		const updateData: IDataObject = {};

		// Build update data from additionalFields
		if (additionalFields.firstName || additionalFields.lastName) {
			updateData.firstName = additionalFields.firstName;
			updateData.lastName = additionalFields.lastName;
		}

		if (additionalFields.email) {
			updateData.email = additionalFields.email;
		}

		if (additionalFields.phone || additionalFields.phoneCountryCode || additionalFields.phoneCallingCode) {
			updateData.phone = additionalFields.phone;
			updateData.phoneCountryCode = additionalFields.phoneCountryCode;
			updateData.phoneCallingCode = additionalFields.phoneCallingCode;
		}

		if (additionalFields.jobTitle !== undefined) updateData.jobTitle = additionalFields.jobTitle;
		if (additionalFields.city !== undefined) updateData.city = additionalFields.city;
		if (additionalFields.avatarUrl !== undefined) updateData.avatarUrl = additionalFields.avatarUrl;

		// Handle company name lookup
		if (additionalFields.companyName) {
			const companyResult = await findCompanyUnifiedGraphQL.call(context, 'name', additionalFields.companyName, undefined, false);
			if (companyResult.found) {
				updateData.companyId = companyResult.company.id;
			} else {
				throw new NodeOperationError(
					context.getNode(),
					`Company not found: ${additionalFields.companyName}`
				);
			}
		}

		if (additionalFields.linkedinUrl) {
			updateData.linkedinUrl = additionalFields.linkedinUrl;
		}

		if (additionalFields.xUrl) {
			updateData.xUrl = additionalFields.xUrl;
		}

		// Handle custom field values
		if (customFields.customField && Array.isArray(customFields.customField)) {
			for (const field of customFields.customField) {
				if (field.fieldName && field.fieldValue !== undefined) {
					// Resolve field name with fallback
					const fieldResolution = await resolveFieldName.call(context, 'person', field.fieldName);

					if (fieldResolution.fieldExists || fieldResolution.fallbackUsed) {
						const resolvedField = fieldResolution.resolvedField!;

						if (resolvedField.includes('Link')) {
							// For link fields - store as URL
							updateData[`${resolvedField}Url`] = field.fieldValue;
						} else {
							// For text fields
							updateData[resolvedField] = field.fieldValue;
						}
					} else {
						throw new NodeOperationError(
							context.getNode(),
							`Custom field "${field.fieldName}" not found. Tried: ${fieldResolution.triedFields.join(', ')}.`
						);
					}
				}
			}
		}

		// Use unified GraphQL update operation that supports all search methods
		const updateResult = await updatePersonUnifiedGraphQL.call(context, searchBy, searchValue, updateData);

		return {
			updated: updateResult.updated,
			person: updateResult.person,
			originalPerson: updateResult.originalPerson,
			searchMethod: searchBy,
			searchValue: searchValue,
			recordId: updateResult.person?.id,
			message: updateResult.updated
				? `Person updated: ${searchValue}`
				: `Update failed: ${updateResult.error}`,
			error: updateResult.error,
		};
	}

	/**
	 * Delete a person
	 */
	static async deletePerson(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const searchBy = context.getNodeParameter('updateSearchBy', i) as string;
		const searchValue = context.getNodeParameter('updateSearchValue', i) as string;

		// First find the person using unified GraphQL search
		const findResult = await findPersonUnifiedGraphQL.call(
			context,
			searchBy,
			searchValue,
			undefined,
			false
		);

		if (!findResult.found) {
			return {
				deleted: false,
				error: 'Person not found',
				searchMethod: searchBy,
				searchValue: searchValue,
				message: `Person not found with ${searchBy}: ${searchValue}`,
			};
		}

		const personId = findResult.person.id;

		// Use GraphQL delete operation
		const deleteResult = await deletePersonGraphQL.call(context, personId);

		return {
			deleted: deleteResult.deleted,
			personId: deleteResult.personId,
			searchMethod: searchBy,
			searchValue: searchValue,
			confidence: findResult.confidence,
			message: deleteResult.deleted
				? `Person deleted: ${searchValue}`
				: `Delete failed: ${deleteResult.error}`,
			error: deleteResult.error,
		};
	}

	/**
	 * List people by company
	 */
	static async listPersonsByCompany(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const companySearchBy = context.getNodeParameter('companySearchBy', i, 'name') as string;
		const companyIdentifier = context.getNodeParameter('companyIdentifier', i) as string;

		let companyId = companyIdentifier;

		// If searching by name, find the company first
		if (companySearchBy === 'name') {
			const findResult = await findCompanyUnifiedGraphQL.call(context, 'name', companyIdentifier, undefined, false);
			if (!findResult.found) {
				return {
					companyId: null,
					people: [],
					totalCount: 0,
					error: 'Company not found',
					message: `Company not found: ${companyIdentifier}`,
				};
			}
			companyId = findResult.company.id;
		}

		const result = await listPersonsByCompanyGraphQL.call(context, companyId);

		return {
			companyId: result.companyId,
			companySearchBy: companySearchBy,
			companyIdentifier: companyIdentifier,
			people: result.people,
			totalCount: result.totalCount,
			message: `Found ${result.totalCount} people in company`,
		};
	}
}