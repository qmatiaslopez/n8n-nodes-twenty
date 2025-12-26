import { INodeProperties } from 'n8n-workflow';
import { PropertyBuilder } from '../builders';
import { OPERATION_DEFINITIONS, RESOURCES, SEARCH_OPTIONS } from '../constants';

const resource = RESOURCES.TASK;
const operations = OPERATION_DEFINITIONS.TASK;
const searchOptions = SEARCH_OPTIONS.TASK;

export const taskProperties: INodeProperties[] = [
	// Task operations
	PropertyBuilder.createOperationProperty(resource, operations),

	// Search configuration for find operations
	PropertyBuilder.createSearchByProperty(resource, searchOptions, 'find'),
	PropertyBuilder.createCustomFieldPathProperty([resource], 'find'),
	PropertyBuilder.createSearchValueProperty([resource], 'find'),

	// Task ID for update/delete operations
	PropertyBuilder.createStringProperty(
		'Task ID',
		'taskId',
		resource,
		['update', 'delete'],
		{
			required: true,
			placeholder: 'UUID',
			description: 'UUID of the task'
		}
	),

	// Create Fields
	PropertyBuilder.createStringProperty('Title', 'title', resource, ['create'], { required: true, description: 'Task title' }),
	
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Task description',
	},
	{
		displayName: 'Due Date',
		name: 'dueAt',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
		default: '',
		description: 'When the task is due',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'To Do', value: 'TODO' },
			{ name: 'In Progress', value: 'IN_PROGRESS' },
			{ name: 'Done', value: 'DONE' },
		],
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
		default: 'TODO',
		description: 'Initial status of the task',
	},
	{
		displayName: 'Position',
		name: 'position',
		type: 'number',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'Position of the task in Kanban view',
	},
	{
		displayName: 'Assignee ID',
		name: 'assigneeId',
		type: 'string',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
		default: '',
		description: 'UUID of the workspace member assigned to this task',
	},

	// Targets (Fixed Collection)
	{
		displayName: 'Related To',
		name: 'taskTargets',
		type: 'fixedCollection',
		placeholder: 'Add Item',
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
							{ name: 'Opportunity', value: 'opportunity' },
						],
						default: 'person',
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
						description: 'UUID of the person',
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
						description: 'UUID of the company',
					},
					{
						displayName: 'Opportunity ID',
						name: 'opportunityId',
						type: 'string',
						required: true,
						displayOptions: {
							show: {
								targetType: ['opportunity'],
							},
						},
						default: '',
						description: 'UUID of the opportunity',
					},
				],
			},
		],
	},

	// Update Fields
	PropertyBuilder.createStringProperty('Title', 'title', resource, ['update'], { description: 'New title' }),
	{
		displayName: 'Body',
		name: 'body',
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
		description: 'New task description',
	},
	{
		displayName: 'Due Date',
		name: 'dueAt',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New due date',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'To Do', value: 'TODO' },
			{ name: 'In Progress', value: 'IN_PROGRESS' },
			{ name: 'Done', value: 'DONE' },
		],
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['update'],
			},
		},
		default: 'TODO',
		description: 'New status',
	},
	{
		displayName: 'Position',
		name: 'position',
		type: 'number',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['update'],
			},
		},
		default: 0,
		description: 'New position of the task',
	},
	{
		displayName: 'Assignee ID',
		name: 'assigneeId',
		type: 'string',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New assignee UUID',
	},
];
