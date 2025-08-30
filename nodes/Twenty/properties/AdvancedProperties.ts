import { INodeProperties } from 'n8n-workflow';
import { PropertyBuilder } from '../builders';

export const advancedProperties: INodeProperties[] = [
	// Advanced options - appears at the bottom of the UI
	PropertyBuilder.createAdvancedOptionsProperty(),
];