import { ILoadOptionsFunctions, IRequestOptions, NodeOperationError } from 'n8n-workflow';

/**
 * Utility class for consolidated load options functionality
 */
export class LoadOptionsUtils {
	/**
	 * Generic function to load resources from GraphQL
	 */
	static async loadGraphQLResources(
		context: ILoadOptionsFunctions, 
		resourceName: string, 
		fields: string,
		labelField?: string,
		fallbackLabel?: (item: any) => string
	) {
		try {
			const credentials = await context.getCredentials('twentyApi');
			if (!credentials) {
				throw new NodeOperationError(context.getNode(), 'No credentials returned!');
			}
			
			const query = `
				query Load${resourceName}($first: Int) {
					${resourceName.toLowerCase()}(first: $first) {
						edges {
							node {
								id
								${fields}
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
			
			const response = await context.helpers.requestWithAuthentication.call(context, 'twentyApi', options);
			
			if (response.errors && response.errors.length > 0) {
				const errorMessages = response.errors.map((error: any) => error.message).join('; ');
				throw new NodeOperationError(context.getNode(), `GraphQL Error: ${errorMessages}`);
			}
			
			const items = response.data?.[resourceName.toLowerCase()]?.edges?.map((edge: any) => edge.node) || [];
			
			return items.map((item: any) => {
				let name: string;
				
				if (labelField && item[labelField]) {
					name = item[labelField];
				} else if (fallbackLabel) {
					name = fallbackLabel(item);
				} else {
					name = `${resourceName} ${item.id.slice(0, 8)}`;
				}
				
				return {
					name,
					value: item.id,
				};
			});
			
		} catch (error) {
			throw new NodeOperationError(context.getNode(), `Failed to load ${resourceName.toLowerCase()}: ${error.message}`);
		}
	}

	/**
	 * Load companies with consolidated logic
	 */
	static async loadCompanies(context: ILoadOptionsFunctions) {
		return this.loadGraphQLResources(context, 'Companies', 'name', 'name');
	}

	/**
	 * Load people with consolidated logic
	 */
	static async loadPeople(context: ILoadOptionsFunctions) {
		return this.loadGraphQLResources(
			context, 
			'People', 
			'name { firstName lastName }',
			undefined,
			(person: any) => `${person.name?.firstName || ''} ${person.name?.lastName || ''}`.trim() || `Person ${person.id.slice(0, 8)}`
		);
	}

	/**
	 * Load opportunities with consolidated logic
	 */
	static async loadOpportunities(context: ILoadOptionsFunctions) {
		return this.loadGraphQLResources(context, 'Opportunities', 'name', 'name');
	}

	/**
	 * Load notes with consolidated logic
	 */
	static async loadNotes(context: ILoadOptionsFunctions) {
		return this.loadGraphQLResources(context, 'Notes', 'title', 'title');
	}

	/**
	 * Load tasks with consolidated logic
	 */
	static async loadTasks(context: ILoadOptionsFunctions) {
		return this.loadGraphQLResources(context, 'Tasks', 'title', 'title');
	}

	/**
	 * Load message threads with consolidated logic
	 */
	static async loadMessageThreads(context: ILoadOptionsFunctions) {
		return this.loadGraphQLResources(
			context, 
			'MessageThreads', 
			'',
			undefined,
			(thread: any) => `Thread ${thread.id.slice(0, 8)}`
		);
	}
}