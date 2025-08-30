import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';

/**
 * Utility class for common validations and error handling
 */
export class ValidationUtils {
	/**
	 * Validates if a string is a valid Twenty UUID
	 */
	static isValidUuid(value: string): boolean {
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		return uuidRegex.test(value);
	}

	/**
	 * Validates and throws error if UUID is invalid
	 */
	static validateUuid(context: IExecuteFunctions, id: string, type: string): void {
		if (!this.isValidUuid(id)) {
			throw new NodeOperationError(
				context.getNode(),
				`Invalid ${type} ID format. Must be a valid UUID.`
			);
		}
	}

	/**
	 * Validates required field presence
	 */
	static validateRequiredField(context: IExecuteFunctions, value: any, fieldName: string): void {
		if (value === undefined || value === null || value === '') {
			throw new NodeOperationError(
				context.getNode(),
				`${fieldName} is required but was not provided.`
			);
		}
	}

	/**
	 * Validates email format
	 */
	static isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Validates email and throws error if invalid
	 */
	static validateEmail(context: IExecuteFunctions, email: string): void {
		if (!this.isValidEmail(email)) {
			throw new NodeOperationError(
				context.getNode(),
				`Invalid email format: ${email}`
			);
		}
	}

	/**
	 * Validates array has minimum length
	 */
	static validateMinLength(context: IExecuteFunctions, array: any[], minLength: number, fieldName: string): void {
		if (!Array.isArray(array) || array.length < minLength) {
			throw new NodeOperationError(
				context.getNode(),
				`${fieldName} must have at least ${minLength} items.`
			);
		}
	}
}