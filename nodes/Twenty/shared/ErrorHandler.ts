import { IExecuteFunctions, NodeOperationError, NodeApiError } from 'n8n-workflow';

/**
 * Centralized error handling utility for GraphQL operations
 */
export class ErrorHandler {
	/**
	 * Handles GraphQL errors with consistent formatting
	 */
	static handleGraphQLError(context: IExecuteFunctions, error: any, operation: string): never {
		let errorMessage = `${operation} failed`;
		
		if (error.response?.data?.errors) {
			const errorMessages = error.response.data.errors.map((err: any) => err.message).join('; ');
			errorMessage = `GraphQL Error in ${operation}: ${errorMessages}`;
		} else if (error.message) {
			errorMessage = `${operation} Error: ${error.message}`;
		}
		
		throw new NodeApiError(context.getNode(), error, { message: errorMessage });
	}

	/**
	 * Handles validation errors with consistent formatting
	 */
	static handleValidationError(context: IExecuteFunctions, message: string): never {
		throw new NodeOperationError(context.getNode(), `Validation Error: ${message}`);
	}

	/**
	 * Handles not found errors
	 */
	static handleNotFoundError(context: IExecuteFunctions, resource: string, identifier: string): never {
		throw new NodeOperationError(
			context.getNode(),
			`${resource} not found: ${identifier}`
		);
	}

	/**
	 * Handles unauthorized errors
	 */
	static handleUnauthorizedError(context: IExecuteFunctions, operation: string): never {
		throw new NodeOperationError(
			context.getNode(),
			`Unauthorized: Cannot perform ${operation}. Please check your credentials and permissions.`
		);
	}

	/**
	 * Handles missing credentials error
	 */
	static handleMissingCredentials(context: IExecuteFunctions): never {
		throw new NodeOperationError(
			context.getNode(),
			'No credentials returned! Please configure your Twenty API credentials.'
		);
	}

	/**
	 * Wraps async operations with error handling
	 */
	static async wrapWithErrorHandling<T>(
		context: IExecuteFunctions,
		operation: string,
		asyncOperation: () => Promise<T>
	): Promise<T> {
		try {
			return await asyncOperation();
		} catch (error) {
			this.handleGraphQLError(context, error, operation);
		}
	}
}