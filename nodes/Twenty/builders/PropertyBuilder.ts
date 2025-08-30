import { INodeProperties } from 'n8n-workflow';
import { SearchOption, OperationDefinition } from '../types';

export class PropertyBuilder {
	/**
	 * Creates a search by property for a specific resource
	 */
	static createSearchByProperty(resource: string, options: readonly SearchOption[], operationType: 'find' | 'update' | 'delete' = 'find'): INodeProperties {
		const fieldName = operationType === 'find' ? 'searchBy' : 'updateSearchBy';
		
		return {
			displayName: 'Search By',
			name: fieldName,
			type: 'options',
			options: options as any,
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operationType]
				}
			},
			default: options[0]?.value || 'email',
			description: `How to search for the ${resource}`
		};
	}

	/**
	 * Creates a search value property for multiple resources
	 */
	static createSearchValueProperty(resources: string[], operationType: 'find' | 'update' | 'delete' = 'find'): INodeProperties {
		const fieldName = operationType === 'find' ? 'searchValue' : 'updateSearchValue';
		
		return {
			displayName: 'Search Value',
			name: fieldName,
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: resources,
					operation: [operationType]
				}
			},
			default: '',
			placeholder: 'Value to search for',
			description: 'The value to search for in the selected field'
		};
	}

	/**
	 * Creates a custom field path property
	 */
	static createCustomFieldPathProperty(resources: string[], operationType: 'find' | 'update' | 'delete' = 'find'): INodeProperties {
		const fieldName = operationType === 'find' ? 'customFieldPath' : 'updateCustomFieldPath';
		const searchByField = operationType === 'find' ? 'searchBy' : 'updateSearchBy';
		
		return {
			displayName: 'Field Path',
			name: fieldName,
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					[searchByField]: ['customField'],
					resource: resources,
					operation: [operationType]
				}
			},
			default: '',
			placeholder: 'linkedinLink.primaryLinkUrl or jobTitle',
			description: 'Field name or nested path (e.g., emails.primaryEmail, linkedinLink.primaryLinkUrl, jobTitle)'
		};
	}

	/**
	 * Creates operation options for a resource
	 */
	static createOperationProperty(resource: string, operations: readonly OperationDefinition[]): INodeProperties {
		return {
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: [resource]
				}
			},
			options: operations as any,
			default: operations[0]?.value || 'find'
		};
	}

	/**
	 * Creates a collection of additional fields
	 */
	static createAdditionalFieldsProperty(resource: string, operations: string[], options: INodeProperties[]): INodeProperties {
		return {
			displayName: 'Additional Fields',
			name: 'additionalFields',
			type: 'collection',
			placeholder: 'Add Field',
			displayOptions: {
				show: {
					resource: [resource],
					operation: operations
				}
			},
			default: {},
			options
		};
	}

	/**
	 * Creates a custom field values property (for updates)
	 */
	static createCustomFieldsProperty(resource: string): INodeProperties {
		return {
			displayName: 'Custom Field Values',
			name: 'customFields',
			type: 'fixedCollection',
			placeholder: 'Add Custom Field',
			displayOptions: {
				show: {
					resource: [resource],
					operation: ['update']
				}
			},
			default: {},
			typeOptions: {
				multipleValues: true
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
							description: 'Name of the custom field to update'
						},
						{
							displayName: 'Field Value',
							name: 'fieldValue',
							type: 'string',
							default: '',
							placeholder: 'https://linkedin.com/in/profile',
							description: 'New value for the custom field'
						}
					]
				}
			]
		};
	}

	/**
	 * Creates a basic string field property
	 */
	static createStringProperty(
		displayName: string,
		name: string,
		resource: string,
		operations: string[],
		options: {
			required?: boolean;
			placeholder?: string;
			description?: string;
			default?: string;
		} = {}
	): INodeProperties {
		return {
			displayName,
			name,
			type: 'string',
			required: options.required || false,
			displayOptions: {
				show: {
					resource: [resource],
					operation: operations
				}
			},
			default: options.default || '',
			placeholder: options.placeholder,
			description: options.description
		};
	}

	/**
	 * Creates a basic number property
	 */
	static createNumberProperty(
		displayName: string,
		name: string,
		resource: string,
		operations: string[],
		options: {
			required?: boolean;
			description?: string;
			default?: number;
			min?: number;
			max?: number;
		} = {}
	): INodeProperties {
		const property: INodeProperties = {
			displayName,
			name,
			type: 'number',
			displayOptions: {
				show: {
					resource: [resource],
					operation: operations
				}
			},
			default: options.default || 0,
			description: options.description
		};

		if (options.min !== undefined || options.max !== undefined) {
			property.typeOptions = {};
			if (options.min !== undefined) property.typeOptions.minValue = options.min;
			if (options.max !== undefined) property.typeOptions.maxValue = options.max;
		}

		return property;
	}
}