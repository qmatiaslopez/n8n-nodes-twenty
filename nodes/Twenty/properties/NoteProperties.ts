import { INodeProperties } from 'n8n-workflow';
import { PropertyBuilder } from '../builders';
import { OPERATION_DEFINITIONS, RESOURCES } from '../constants';

const resource = RESOURCES.NOTE;
const operations = OPERATION_DEFINITIONS.NOTE;

export const noteProperties: INodeProperties[] = [
	// Note operations
	PropertyBuilder.createOperationProperty(resource, operations),

	// Note title for create operations
	PropertyBuilder.createStringProperty(
		'Note Title',
		'noteTitle',
		resource,
		['create'],
		{
			required: true,
			description: 'Title of the note'
		}
	),

	// Note title for update operations (optional)
	PropertyBuilder.createStringProperty(
		'Note Title',
		'noteTitle',
		resource,
		['update'],
		{
			description: 'New title for the note (leave empty to keep current)'
		}
	),

	// Note content for create operations
	{
		displayName: 'Note Content',
		name: 'noteBody',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Content/body of the note',
	},

	// Note content for update operations (optional)
	{
		displayName: 'Note Content',
		name: 'noteBody',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New content for the note (leave empty to keep current)',
	},

	// Note ID for update/delete operations
	PropertyBuilder.createStringProperty(
		'Note ID',
		'noteId',
		resource,
		['update', 'delete'],
		{
			required: true,
			placeholder: 'e.g., 123e4567-e89b-12d3-a456-426614174000',
			description: 'UUID of the note to update or delete'
		}
	),

	// Multiple targets for createNote
	{
		displayName: 'Assign To',
		name: 'noteTargets',
		type: 'fixedCollection',
		placeholder: 'Add Person or Company',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		options: [
			{
				name: 'target',
				displayName: 'Target',
				values: [
					{
						displayName: 'Target Type',
						name: 'targetType',
						type: 'options',
						options: [
							{ name: 'Person', value: 'person' },
							{ name: 'Company', value: 'company' },
						],
						default: 'person',
						description: 'Whether to assign the note to a person or company',
					},
					{
						displayName: 'Person ID',
						name: 'personId',
						type: 'string',
						required: true,
						displayOptions: {
							show: {
								targetType: ['person'],
							},
						},
						default: '',
						placeholder: 'e.g., 123e4567-e89b-12d3-a456-426614174000',
						description: 'UUID of the person to assign the note to',
					},
					{
						displayName: 'Company ID',
						name: 'companyId',
						type: 'string',
						required: true,
						displayOptions: {
							show: {
								targetType: ['company'],
							},
						},
						default: '',
						placeholder: 'e.g., 987fcdeb-51a2-43d1-b123-426614174111',
						description: 'UUID of the company to assign the note to',
					},
				],
			},
		],
	},

	// List notes configuration
	{
		displayName: 'List Notes By',
		name: 'listNotesBy',
		type: 'options',
		options: [
			{ name: 'Person', value: 'person' },
			{ name: 'Company', value: 'company' },
		],
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['list'],
			},
		},
		default: 'person',
		description: 'Whether to list notes for a person or company',
	},

	// Person ID for listing notes
	PropertyBuilder.createStringProperty(
		'Person ID',
		'personId',
		resource,
		['list'],
		{
			required: true,
			placeholder: 'e.g., 123e4567-e89b-12d3-a456-426614174000',
			description: 'UUID of the person to list notes for'
		}
	),

	// Company ID for listing notes
	PropertyBuilder.createStringProperty(
		'Company ID',
		'companyId',
		resource,
		['list'],
		{
			required: true,
			placeholder: 'e.g., 987fcdeb-51a2-43d1-b123-426614174111',
			description: 'UUID of the company to list notes for'
		}
	),
];