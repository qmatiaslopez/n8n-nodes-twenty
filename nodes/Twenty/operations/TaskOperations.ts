import { IExecuteFunctions, IDataObject, NodeOperationError } from 'n8n-workflow';
import {
	createTaskGraphQL,
	createTaskTargetGraphQL,
	updateTaskGraphQL,
	deleteTaskGraphQL,
	findTaskUnifiedGraphQL,
	listTasksGraphQL,
	isValidTwentyUuid,
} from '../GenericFunctions';

export class TaskOperations {
	/**
	 * Create a new task
	 */
	static async createTask(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const title = context.getNodeParameter('title', i) as string;
		const body = context.getNodeParameter('body', i, '') as string;
		const dueAt = context.getNodeParameter('dueAt', i, '') as string;
		const status = context.getNodeParameter('status', i) as string;
		const position = context.getNodeParameter('position', i, 0) as number;
		const assigneeId = context.getNodeParameter('assigneeId', i, '') as string;
		const taskTargets = context.getNodeParameter('taskTargets.target', i, []) as IDataObject[];

		try {
			// 1. Prepare task data
			const taskData: IDataObject = {
				title: title,
				status: status,
				position: position
			};

			if (body) {
				taskData.bodyV2 = {
					markdown: body,
				};
			}

			if (dueAt) {
				taskData.dueAt = dueAt;
			}

			if (assigneeId) {
				if (!isValidTwentyUuid(assigneeId)) {
					throw new NodeOperationError(context.getNode(), 'Invalid assignee ID format');
				}
				taskData.assigneeId = assigneeId;
			}

			// 2. Create the task
			const createdTask = await createTaskGraphQL.call(context, taskData);
			const taskId = createdTask.id;

			// 3. Create targets if any
			const createdTargets = [];
			const targetErrors = [];

			if (taskTargets && taskTargets.length > 0) {
				for (let idx = 0; idx < taskTargets.length; idx++) {
					const target = taskTargets[idx];
					const targetType = target.targetType as string;
					const targetData: IDataObject = { taskId };

					try {
						if (targetType === 'person') {
							const personId = target.personId as string;
							if (personId) {
								if (!isValidTwentyUuid(personId)) throw new Error('Invalid person ID');
								targetData.personId = personId;
							}
						} else if (targetType === 'company') {
							const companyId = target.companyId as string;
							if (companyId) {
								if (!isValidTwentyUuid(companyId)) throw new Error('Invalid company ID');
								targetData.companyId = companyId;
							}
						} else if (targetType === 'opportunity') {
							const opportunityId = target.opportunityId as string;
							if (opportunityId) {
								if (!isValidTwentyUuid(opportunityId)) throw new Error('Invalid opportunity ID');
								targetData.opportunityId = opportunityId;
							}
						}

						if (Object.keys(targetData).length > 1) { // taskId + at least one other field
							const createdTarget = await createTaskTargetGraphQL.call(context, targetData);
							createdTargets.push({
								...createdTarget,
								targetType: targetType
							});
						}
					} catch (error) {
						targetErrors.push({
							index: idx,
							type: targetType,
							error: error.message
						});
					}
				}
			}

			return {
				success: true,
				task: {
					...createdTask,
					targets: createdTargets,
				},
				targetErrors: targetErrors.length > 0 ? targetErrors : undefined,
			};

		} catch (error) {
			throw new NodeOperationError(context.getNode(), `Failed to create task: ${error.message}`);
		}
	}

	/**
	 * Update a task
	 */
	static async updateTask(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const taskId = context.getNodeParameter('taskId', i) as string;
		
		try {
			if (!isValidTwentyUuid(taskId)) {
				throw new NodeOperationError(context.getNode(), 'Invalid task ID format');
			}

			const updateData: IDataObject = {};
			
			// Optional fields
			const title = context.getNodeParameter('title', i, '') as string;
			if (title) updateData.title = title;

			const body = context.getNodeParameter('body', i, '') as string;
			if (body) {
				updateData.bodyV2 = {
					markdown: body,
				};
			}

			const dueAt = context.getNodeParameter('dueAt', i, '') as string;
			if (dueAt) updateData.dueAt = dueAt;

			const status = context.getNodeParameter('status', i) as string;
			if (status) updateData.status = status;

			const position = context.getNodeParameter('position', i, null) as number | null;
			if (position !== null) updateData.position = position;

			const assigneeId = context.getNodeParameter('assigneeId', i, '') as string;
			if (assigneeId) {
				if (!isValidTwentyUuid(assigneeId)) {
					throw new NodeOperationError(context.getNode(), 'Invalid assignee ID format');
				}
				updateData.assigneeId = assigneeId;
			}

			if (Object.keys(updateData).length === 0) {
				return {
					updated: false,
					message: 'No fields to update provided'
				};
			}

			const result = await updateTaskGraphQL.call(context, taskId, updateData);
			
			return {
				success: result.updated,
				task: result.task,
				error: result.error
			};

		} catch (error) {
			throw new NodeOperationError(context.getNode(), `Failed to update task: ${error.message}`);
		}
	}

	/**
	 * Delete a task
	 */
	static async deleteTask(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const taskId = context.getNodeParameter('taskId', i) as string;

		try {
			if (!isValidTwentyUuid(taskId)) {
				throw new NodeOperationError(context.getNode(), 'Invalid task ID format');
			}

			const result = await deleteTaskGraphQL.call(context, taskId);

			return {
				success: result.deleted,
				taskId: result.taskId,
				error: result.error
			};

		} catch (error) {
			throw new NodeOperationError(context.getNode(), `Failed to delete task: ${error.message}`);
		}
	}

	/**
	 * Find a task
	 */
	static async findTask(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const searchBy = context.getNodeParameter('searchBy', i) as string;
		const searchValue = context.getNodeParameter('searchValue', i) as string;
		
		let customFieldPath: string | undefined;
		if (searchBy === 'customField') {
			customFieldPath = context.getNodeParameter('customFieldPath', i) as string;
		}

		return await findTaskUnifiedGraphQL.call(context, searchBy, searchValue, customFieldPath);
	}

	/**
	 * List tasks
	 */
	static async listTasks(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		// Currently no filters exposed in properties, just limit if we added it (we didn't explicitly add limit property yet)
		// Default limit is 50 in generic function
		
		// If we want to support filters later, we can extract them here
		// const filters: IDataObject = {};
		
		return await listTasksGraphQL.call(context, 50);
	}
}
