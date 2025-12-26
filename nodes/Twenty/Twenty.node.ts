import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

// Import properties factory
import { buildNodeProperties } from './properties';
import { ERROR_MESSAGES } from './constants';

// Import operations modules
import { PersonOperations } from './operations/PersonOperations';
import { CompanyOperations } from './operations/CompanyOperations';
import { OpportunityOperations } from './operations/OpportunityOperations';
import { NoteOperations } from './operations/NoteOperations';
import { TaskOperations } from './operations/TaskOperations';

export class Twenty implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twenty CRM',
		name: 'twenty',
		icon: 'file:twenty.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Twenty CRM using smart workflows',
		defaults: {
			name: 'Twenty',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'twentyApi',
				required: true,
			},
		],
		properties: buildNodeProperties(),
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			// Get resource and operation from categorized structure
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				let responseData: any;

				// Execute operation based on resource and operation
				const resourceOperation = `${resource}:${operation}`;
				switch (resourceOperation) {
				// NOTE OPERATIONS
					case 'note:create':
						responseData = await NoteOperations.createNote(this, i);
						break;

					case 'note:list':
						responseData = await NoteOperations.listNotes(this, i);
						break;

					case 'note:update':
						responseData = await NoteOperations.updateNote(this, i);
						break;

					case 'note:delete':
						responseData = await NoteOperations.deleteNote(this, i);
						break;

					// PERSON OPERATIONS
					case 'person:find':
						responseData = await PersonOperations.findPerson(this, i);
						break;

					case 'person:create':
						responseData = await PersonOperations.createPerson(this, i);
						break;

					case 'person:update':
						responseData = await PersonOperations.updatePerson(this, i);
						break;

					case 'person:delete':
						responseData = await PersonOperations.deletePerson(this, i);
						break;

					case 'person:listByCompany':
						responseData = await PersonOperations.listPersonsByCompany(this, i);
						break;

					// COMPANY OPERATIONS
					case 'company:find':
						responseData = await CompanyOperations.findCompany(this, i);
						break;

					case 'company:create':
						responseData = await CompanyOperations.createCompany(this, i);
						break;

					case 'company:update':
						responseData = await CompanyOperations.updateCompany(this, i);
						break;

					case 'company:delete':
						responseData = await CompanyOperations.deleteCompany(this, i);
						break;

					// OPPORTUNITY OPERATIONS
					case 'opportunity:find':
						responseData = await OpportunityOperations.findOpportunity(this, i);
						break;

					case 'opportunity:create':
						responseData = await OpportunityOperations.createOpportunity(this, i);
						break;

					case 'opportunity:update':
						responseData = await OpportunityOperations.updateOpportunity(this, i);
						break;

					case 'opportunity:delete':
						responseData = await OpportunityOperations.deleteOpportunity(this, i);
						break;

					case 'opportunity:list':
						responseData = await OpportunityOperations.listOpportunities(this, i);
						break;

					// TASK OPERATIONS
					case 'task:create':
						responseData = await TaskOperations.createTask(this, i);
						break;

					case 'task:update':
						responseData = await TaskOperations.updateTask(this, i);
						break;

					case 'task:delete':
						responseData = await TaskOperations.deleteTask(this, i);
						break;

					case 'task:find':
						responseData = await TaskOperations.findTask(this, i);
						break;

					case 'task:list':
						responseData = await TaskOperations.listTasks(this, i);
						break;

					default:
						throw new NodeOperationError(this.getNode(), ERROR_MESSAGES.UNKNOWN_RESOURCE_OPERATION(resourceOperation));
				}

				returnData.push({ json: responseData });

			} catch (error) {
				if (this.continueOnFail()) {
					const operation_info = { resource, operation };

					returnData.push({
						json: { 
							error: error.message,
							...operation_info,
							success: false,
						},
						error,
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}