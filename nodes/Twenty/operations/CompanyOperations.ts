import { IExecuteFunctions, IDataObject, NodeOperationError } from 'n8n-workflow';
import {
	findCompanyUnifiedGraphQL,
	findOrCreateCompanyGraphQL,
	deleteCompanyGraphQL,
	updateCompanyGraphQL,
	resolveFieldName,
	findWorkspaceMemberByEmailGraphQL,
} from '../GenericFunctions';

export class CompanyOperations {
	/**
	 * Find company by name or custom field
	 */
	static async findCompany(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const searchBy = context.getNodeParameter('searchBy', i) as string;
		const searchValue = context.getNodeParameter('searchValue', i) as string;
		
		let customFieldPath: string | undefined;
		if (searchBy === 'customField') {
			customFieldPath = context.getNodeParameter('customFieldPath', i) as string;
		}

		const result = await findCompanyUnifiedGraphQL.call(
			context,
			searchBy,
			searchValue,
			customFieldPath,
			true
		);

		return {
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
	}

	/**
	 * Create a new company
	 */
	static async createCompany(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const companyName = context.getNodeParameter('companyName', i) as string;
		const additionalFields = context.getNodeParameter('additionalFields', i, {}) as any;

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

		// Handle Account Owner lookup
		if (additionalFields.accountOwnerEmail) {
			const ownerResult = await findWorkspaceMemberByEmailGraphQL.call(context, additionalFields.accountOwnerEmail);
			if (ownerResult.found) {
				companyData.accountOwnerId = ownerResult.workspaceMember.id;
			} else {
				throw new NodeOperationError(
					context.getNode(),
					`Account owner not found: ${additionalFields.accountOwnerEmail}`
				);
			}
		}

		const result = await findOrCreateCompanyGraphQL.call(context, companyData);

		return {
			created: result.created,
			action: result.action,
			company: result.company,
			confidence: result.confidence,
			recordId: result.company?.id,
			message: result.created
				? `Company created: ${companyName}`
				: `Company already exists: ${companyName}`,
		};
	}

	/**
	 * Update an existing company
	 */
	static async updateCompany(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const searchBy = context.getNodeParameter('updateSearchBy', i) as string;
		const searchValue = context.getNodeParameter('updateSearchValue', i) as string;
		const additionalFields = context.getNodeParameter('additionalFields', i, {}) as any;

		// First find the company using unified GraphQL search
		const findResult = await findCompanyUnifiedGraphQL.call(
			context,
			searchBy,
			searchValue,
			undefined,
			false
		);

		if (!findResult.found || findResult.confidence < 0.8) {
			return {
				updated: false,
				error: findResult.found
					? 'No exact match found, update cancelled'
					: 'Company not found',
				searchMethod: searchBy,
				searchValue: searchValue,
				confidence: findResult.confidence || 0,
				message: `Company not found or low confidence match with ${searchBy}: ${searchValue}`,
			};
		}

		const companyId = findResult.company.id;
		const updateData: IDataObject = {};

		if (additionalFields.name !== undefined) updateData.name = additionalFields.name;

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

		// Handle Account Owner lookup
		if (additionalFields.accountOwnerEmail) {
			const ownerResult = await findWorkspaceMemberByEmailGraphQL.call(context, additionalFields.accountOwnerEmail);
			if (ownerResult.found) {
				updateData.accountOwnerId = ownerResult.workspaceMember.id;
			} else {
				throw new NodeOperationError(
					context.getNode(),
					`Account owner not found: ${additionalFields.accountOwnerEmail}`
				);
			}
		}

		// Handle custom fields
		const customFields = context.getNodeParameter('customFields', i, {}) as any;
		if (customFields && customFields.customField && customFields.customField.length > 0) {
			for (const field of customFields.customField) {
				if (field.fieldName && field.fieldValue !== undefined) {
					// Resolve field name with fallback
					const fieldResolution = await resolveFieldName.call(context, 'company', field.fieldName);

					if (fieldResolution.fieldExists || fieldResolution.fallbackUsed) {
						const resolvedField = fieldResolution.resolvedField!;

						if (resolvedField.includes('Link')) {
							// For link fields
							updateData[resolvedField] = { primaryLinkUrl: field.fieldValue };
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

		// Use GraphQL update operation
		const updateResult = await updateCompanyGraphQL.call(context, companyId, updateData);

		return {
			updated: updateResult.updated,
			company: updateResult.company,
			originalCompany: findResult.company,
			searchMethod: searchBy,
			searchValue: searchValue,
			confidence: findResult.confidence,
			recordId: updateResult.company?.id,
			message: updateResult.updated
				? `Company updated: ${searchValue}`
				: `Update failed: ${updateResult.error}`,
			error: updateResult.error,
		};
	}

	/**
	 * Delete a company
	 */
	static async deleteCompany(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const searchBy = context.getNodeParameter('updateSearchBy', i) as string;
		const searchValue = context.getNodeParameter('updateSearchValue', i) as string;
		
		let customFieldPath: string | undefined;
		if (searchBy === 'customField') {
			customFieldPath = context.getNodeParameter('updateCustomFieldPath', i) as string;
		}

		// First find the company using unified GraphQL search
		const findResult = await findCompanyUnifiedGraphQL.call(
			context,
			searchBy,
			searchValue,
			customFieldPath,
			false
		);

		if (!findResult.found || findResult.confidence < 0.9) {
			return {
				deleted: false,
				error: findResult.found
					? 'No exact match found, delete cancelled'
					: 'Company not found',
				searchMethod: searchBy,
				searchValue: searchValue,
				confidence: findResult.confidence || 0,
				message: `Company not found or no exact match with ${searchBy}: ${searchValue}`,
			};
		}

		const companyId = findResult.company.id;

		// Use GraphQL delete operation
		const deleteResult = await deleteCompanyGraphQL.call(context, companyId);

		return {
			deleted: deleteResult.deleted,
			companyId: deleteResult.companyId,
			searchMethod: searchBy,
			searchValue: searchValue,
			confidence: findResult.confidence,
			message: deleteResult.deleted
				? `Company deleted: ${searchValue}`
				: `Delete failed: ${deleteResult.error}`,
			error: deleteResult.error,
		};
	}
}