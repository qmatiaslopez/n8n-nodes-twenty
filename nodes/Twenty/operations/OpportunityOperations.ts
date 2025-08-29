import { IExecuteFunctions, IDataObject, NodeOperationError } from 'n8n-workflow';
import {
	findOpportunityUnifiedGraphQL,
	findOrCreateOpportunityGraphQL,
	deleteOpportunityGraphQL,
	updateOpportunityGraphQL,
	listOpportunitiesGraphQL,
	findCompanyUnifiedGraphQL,
	findPersonUnifiedGraphQL,
} from '../GenericFunctions';

export class OpportunityOperations {
	/**
	 * Find opportunity by name or custom field
	 */
	static async findOpportunity(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const searchBy = context.getNodeParameter('searchBy', i) as string;
		const searchValue = context.getNodeParameter('searchValue', i) as string;
		
		let additionalFields: IDataObject = {};
		if (searchBy === 'customField') {
			additionalFields.customFieldPath = context.getNodeParameter('customFieldPath', i) as string;
		}

		const result = await findOpportunityUnifiedGraphQL.call(
			context,
			searchBy,
			searchValue,
			additionalFields,
			true
		);

		return {
			found: result.found,
			opportunity: result.opportunity,
			confidence: result.confidence,
			recordId: result.opportunity?.id || null,
			searchMethod: result.searchMethod,
			searchValue: result.searchValue,
			totalMatches: result.totalMatches || 0,
			message: result.found
				? `Opportunity found: ${result.opportunity.name}`
				: `No opportunity found with ${result.searchMethod}: ${result.searchValue}`,
		};
	}

	/**
	 * Create a new opportunity
	 */
	static async createOpportunity(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const opportunityName = context.getNodeParameter('opportunityName', i) as string;
		const additionalFields = context.getNodeParameter('additionalFields', i, {}) as any;

		const opportunityData: IDataObject = { name: opportunityName };

		// Handle amount and currency
		if (additionalFields.amount || additionalFields.currencyCode) {
			opportunityData.amount = {
				amountMicros: additionalFields.amount || 0,
				currencyCode: additionalFields.currencyCode || 'USD',
			};
		}

		if (additionalFields.closeDate) opportunityData.closeDate = additionalFields.closeDate;
		if (additionalFields.stage) opportunityData.stage = additionalFields.stage;

		// Handle company lookup
		if (additionalFields.companyName) {
			const companyResult = await findCompanyUnifiedGraphQL.call(context, 'name', additionalFields.companyName, undefined, false);
			if (companyResult.found) {
				opportunityData.companyId = companyResult.company.id;
			} else {
				throw new NodeOperationError(
					context.getNode(),
					`Company not found: ${additionalFields.companyName}`
				);
			}
		}

		// Handle point of contact lookup
		if (additionalFields.pointOfContactEmail) {
			const personResult = await findPersonUnifiedGraphQL.call(context, 'email', additionalFields.pointOfContactEmail, undefined, false);
			if (personResult.found) {
				opportunityData.pointOfContactId = personResult.person.id;
			} else {
				throw new NodeOperationError(
					context.getNode(),
					`Point of contact not found: ${additionalFields.pointOfContactEmail}`
				);
			}
		}

		const result = await findOrCreateOpportunityGraphQL.call(context, opportunityData);

		return {
			created: result.created,
			action: result.action,
			opportunity: result.opportunity,
			confidence: result.confidence,
			recordId: result.opportunity?.id,
			message: result.created
				? `Opportunity created: ${opportunityName}`
				: `Opportunity already exists: ${opportunityName}`,
		};
	}

	/**
	 * Update an existing opportunity
	 */
	static async updateOpportunity(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const searchBy = context.getNodeParameter('updateSearchBy', i) as string;
		const searchValue = context.getNodeParameter('updateSearchValue', i) as string;
		const additionalFields = context.getNodeParameter('additionalFields', i, {}) as any;

		// First find the opportunity using unified search
		const findResult = await findOpportunityUnifiedGraphQL.call(
			context,
			searchBy,
			searchValue,
			undefined,
			false
		);

		if (!findResult.found) {
			return {
				updated: false,
				error: 'Opportunity not found',
				searchMethod: searchBy,
				searchValue: searchValue,
				message: `Opportunity not found with ${searchBy}: ${searchValue}`,
			};
		}

		const opportunityId = findResult.opportunity.id;
		const updateData: IDataObject = {};

		// Build update data from additionalFields
		if (additionalFields.name !== undefined) updateData.name = additionalFields.name;

		// Handle amount and currency updates
		if (additionalFields.amount !== undefined || additionalFields.currencyCode !== undefined) {
			updateData.amount = {
				amountMicros: additionalFields.amount || findResult.opportunity.amount?.amountMicros || 0,
				currencyCode: additionalFields.currencyCode || findResult.opportunity.amount?.currencyCode || 'USD',
			};
		}

		if (additionalFields.closeDate !== undefined) updateData.closeDate = additionalFields.closeDate;
		if (additionalFields.stage !== undefined) updateData.stage = additionalFields.stage;

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

		// Handle point of contact lookup
		if (additionalFields.pointOfContactEmail) {
			const personResult = await findPersonUnifiedGraphQL.call(context, 'email', additionalFields.pointOfContactEmail, undefined, false);
			if (personResult.found) {
				updateData.pointOfContactId = personResult.person.id;
			} else {
				throw new NodeOperationError(
					context.getNode(),
					`Point of contact not found: ${additionalFields.pointOfContactEmail}`
				);
			}
		}

		const result = await updateOpportunityGraphQL.call(context, opportunityId, updateData);

		return {
			updated: result.updated,
			opportunity: result.opportunity,
			originalOpportunity: findResult.opportunity,
			searchMethod: searchBy,
			searchValue: searchValue,
			recordId: result.opportunity?.id,
			message: result.updated
				? `Opportunity updated: ${searchValue}`
				: `Update failed: ${result.error}`,
			error: result.error,
		};
	}

	/**
	 * Delete an opportunity
	 */
	static async deleteOpportunity(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const searchBy = context.getNodeParameter('updateSearchBy', i) as string;
		const searchValue = context.getNodeParameter('updateSearchValue', i) as string;
		
		let additionalFields: IDataObject = {};
		if (searchBy === 'customField') {
			additionalFields.customFieldPath = context.getNodeParameter('updateCustomFieldPath', i) as string;
		}

		// First find the opportunity using unified search
		const findResult = await findOpportunityUnifiedGraphQL.call(
			context,
			searchBy,
			searchValue,
			additionalFields,
			false
		);

		if (!findResult.found) {
			return {
				deleted: false,
				error: 'Opportunity not found',
				searchMethod: searchBy,
				searchValue: searchValue,
				message: `Opportunity not found with ${searchBy}: ${searchValue}`,
			};
		}

		const opportunityId = findResult.opportunity.id;
		const result = await deleteOpportunityGraphQL.call(context, opportunityId);

		return {
			deleted: result.deleted,
			opportunityId: result.opportunityId,
			searchMethod: searchBy,
			searchValue: searchValue,
			confidence: findResult.confidence,
			message: result.deleted
				? `Opportunity deleted: ${searchValue}`
				: `Delete failed: ${result.error}`,
			error: result.error,
		};
	}

	/**
	 * List opportunities with filters
	 */
	static async listOpportunities(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const filters = context.getNodeParameter('filters', i, {}) as any;

		const filterParams: IDataObject = {};
		if (filters.stage) filterParams.stage = filters.stage;
		if (filters.companyId) filterParams.companyId = filters.companyId;
		if (filters.pointOfContactId) filterParams.pointOfContactId = filters.pointOfContactId;
		if (filters.searchTerm) filterParams.searchTerm = filters.searchTerm;

		const limit = filters.limit || 50;
		const orderBy = filters.orderBy || 'createdAt:DESC';

		const result = await listOpportunitiesGraphQL.call(
			context,
			filterParams,
			limit,
			orderBy
		);

		return {
			opportunities: result.opportunities,
			totalCount: result.totalCount,
			hasNextPage: result.hasNextPage,
			returnedCount: result.opportunities.length,
			filters: filterParams,
			message: `Found ${result.opportunities.length} opportunities (${result.totalCount} total)`,
		};
	}
}