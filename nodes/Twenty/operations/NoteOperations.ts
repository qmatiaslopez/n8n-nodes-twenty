import { IExecuteFunctions, IDataObject, NodeOperationError } from 'n8n-workflow';
import {
	createNoteGraphQL,
	createNoteTargetGraphQL,
	listNotesByPersonIdGraphQL,
	listNotesByCompanyIdGraphQL,
	updateNoteGraphQL,
	deleteNoteGraphQL,
	isValidTwentyUuid,
} from '../GenericFunctions';

export class NoteOperations {
	/**
	 * Create a new note with multiple targets (persons/companies)
	 */
	static async createNote(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const noteTitle = context.getNodeParameter('noteTitle', i) as string;
		const noteBody = context.getNodeParameter('noteBody', i) as string;
		const noteTargets = context.getNodeParameter('noteTargets.target', i, []) as IDataObject[];

		try {
			// Validate that at least one target is provided
			if (!noteTargets || noteTargets.length === 0) {
				throw new NodeOperationError(
					context.getNode(),
					'At least one target (person or company) must be specified for the note'
				);
			}

			// Validate each target
			for (let idx = 0; idx < noteTargets.length; idx++) {
				const target = noteTargets[idx];
				const targetType = target.targetType as string;

				if (targetType === 'person') {
					const personId = target.personId as string;
					if (!personId || !isValidTwentyUuid(personId)) {
						throw new NodeOperationError(
							context.getNode(),
							`Invalid person ID format in target ${idx + 1}. Must be a valid UUID.`
						);
					}
				} else if (targetType === 'company') {
					const companyId = target.companyId as string;
					if (!companyId || !isValidTwentyUuid(companyId)) {
						throw new NodeOperationError(
							context.getNode(),
							`Invalid company ID format in target ${idx + 1}. Must be a valid UUID.`
						);
					}
				} else {
					throw new NodeOperationError(
						context.getNode(),
						`Invalid target type "${targetType}" in target ${idx + 1}. Must be "person" or "company".`
					);
				}
			}

			// 1. Create the note first
			const noteData: IDataObject = {
				title: noteTitle,
				body: noteBody,
			};

			const createdNote = await createNoteGraphQL.call(context, noteData);
			const noteId = createdNote.id;

			// 2. Create all note targets
			const createdTargets = [];
			const targetErrors = [];

			for (let idx = 0; idx < noteTargets.length; idx++) {
				const target = noteTargets[idx];
				const targetType = target.targetType as string;

				try {
					const targetData: IDataObject = { noteId };

					if (targetType === 'person') {
						targetData.personId = target.personId;
					} else if (targetType === 'company') {
						targetData.companyId = target.companyId;
					}

					const noteTarget = await createNoteTargetGraphQL.call(context, targetData);
					createdTargets.push({
						...noteTarget,
						targetType: targetType,
						targetId: targetType === 'person' ? target.personId : target.companyId,
					});
				} catch (error) {
					targetErrors.push({
						target: idx + 1,
						targetType: targetType,
						targetId: targetType === 'person' ? target.personId : target.companyId,
						error: error.message,
					});
				}
			}

			return {
				success: true,
				note: {
					...createdNote,
					targets: createdTargets,
				},
				noteId: noteId,
				targetCount: createdTargets.length,
				targetErrors: targetErrors.length > 0 ? targetErrors : undefined,
				message: `Note created successfully and assigned to ${createdTargets.length} target(s)${
					targetErrors.length > 0 ? ` (${targetErrors.length} targets failed)` : ''
				}`,
			};
		} catch (error) {
			throw new NodeOperationError(context.getNode(), `Failed to create note: ${error.message}`);
		}
	}

	/**
	 * List notes by person or company (unified interface)
	 */
	static async listNotes(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const listNotesBy = context.getNodeParameter('listNotesBy', i) as string;

		try {
			if (listNotesBy === 'person') {
				const personId = context.getNodeParameter('personId', i) as string;

				if (!personId || !isValidTwentyUuid(personId)) {
					throw new NodeOperationError(
						context.getNode(),
						'Invalid person ID format. Must be a valid UUID.'
					);
				}

				const result = await listNotesByPersonIdGraphQL.call(context, personId);

				return {
					success: true,
					listType: 'person',
					targetId: personId,
					notes: result.notes,
					totalCount: result.totalCount,
					message: `Found ${result.totalCount} note(s) for person ID: ${personId}`,
				};
			} else if (listNotesBy === 'company') {
				const companyId = context.getNodeParameter('companyId', i) as string;

				if (!companyId || !isValidTwentyUuid(companyId)) {
					throw new NodeOperationError(
						context.getNode(),
						'Invalid company ID format. Must be a valid UUID.'
					);
				}

				const result = await listNotesByCompanyIdGraphQL.call(context, companyId);

				return {
					success: true,
					listType: 'company',
					targetId: companyId,
					notes: result.notes,
					totalCount: result.totalCount,
					message: `Found ${result.totalCount} note(s) for company ID: ${companyId}`,
				};
			} else {
				throw new NodeOperationError(
					context.getNode(),
					`Invalid listNotesBy option: ${listNotesBy}. Must be "person" or "company".`
				);
			}
		} catch (error) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(context.getNode(), `Failed to list notes: ${error.message}`);
		}
	}

	/**
	 * Update an existing note
	 */
	static async updateNote(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const noteId = context.getNodeParameter('noteId', i) as string;

		try {
			if (!noteId || !isValidTwentyUuid(noteId)) {
				throw new NodeOperationError(
					context.getNode(),
					'Invalid note ID format. Must be a valid UUID.'
				);
			}

			// Build update data from provided fields
			const updateData: IDataObject = {};

			const noteTitle = context.getNodeParameter('noteTitle', i, '') as string;
			const noteBody = context.getNodeParameter('noteBody', i, '') as string;

			if (noteTitle) updateData.title = noteTitle;
			if (noteBody) updateData.body = noteBody;

			// Check if any data to update
			if (Object.keys(updateData).length === 0) {
				throw new NodeOperationError(
					context.getNode(),
					'No update data provided. Please specify at least one field to update (title or body).'
				);
			}

			const result = await updateNoteGraphQL.call(context, noteId, updateData);

			if (!result.updated) {
				return {
					success: false,
					noteId: noteId,
					error: result.error || 'Failed to update note',
					message: `Failed to update note with ID: ${noteId}`,
				};
			}

			return {
				success: true,
				note: result.note,
				noteId: noteId,
				updatedFields: Object.keys(updateData),
				message: `Note updated successfully`,
			};
		} catch (error) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(context.getNode(), `Failed to update note: ${error.message}`);
		}
	}

	/**
	 * Delete a note
	 */
	static async deleteNote(context: IExecuteFunctions, i: number): Promise<IDataObject> {
		const noteId = context.getNodeParameter('noteId', i) as string;

		try {
			if (!noteId || !isValidTwentyUuid(noteId)) {
				throw new NodeOperationError(
					context.getNode(),
					'Invalid note ID format. Must be a valid UUID.'
				);
			}

			const result = await deleteNoteGraphQL.call(context, noteId);

			if (!result.deleted) {
				return {
					success: false,
					noteId: noteId,
					error: result.error || 'Failed to delete note',
					message: `Failed to delete note with ID: ${noteId}`,
				};
			}

			return {
				success: true,
				deletedNoteId: result.noteId,
				message: `Note deleted successfully`,
			};
		} catch (error) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(context.getNode(), `Failed to delete note: ${error.message}`);
		}
	}
}