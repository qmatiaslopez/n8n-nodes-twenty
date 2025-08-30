import { INodeProperties } from 'n8n-workflow';

export interface SearchOption {
	name: string;
	value: string;
	description?: string;
}

export interface FieldDefinition {
	displayName: string;
	name: string;
	type: string;
	default?: any;
	description?: string;
	required?: boolean;
	placeholder?: string;
}

export interface OperationDefinition {
	name: string;
	value: string;
	description: string;
	action: string;
}

export interface ResourceOperation {
	resource: string;
	operations: OperationDefinition[];
}

export interface PropertyConfig {
	resource: string;
	searchOptions: SearchOption[];
	operations: OperationDefinition[];
	additionalFields?: FieldDefinition[];
}

export type NodeProperty = INodeProperties;
export type NodeProperties = INodeProperties[];