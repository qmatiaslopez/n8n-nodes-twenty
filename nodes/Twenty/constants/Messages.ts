export const ERROR_MESSAGES = {
	FIELD_NOT_FOUND: (field: string, type: string) => 
		`Field "${field}" not found in ${type}`,
	PARENT_FIELD_NOT_FOUND: (field: string, type: string) => 
		`Parent field "${field}" not found in ${type}`,
	CHILD_FIELD_NOT_FOUND: (child: string, parent: string) => 
		`Child field "${child}" not found in "${parent}"`,
	TYPE_NOT_FOUND: (type: string) => 
		`Type "${type}" not found in schema`,
	UNKNOWN_RESOURCE_OPERATION: (resourceOperation: string) =>
		`Unknown resource:operation combination: ${resourceOperation}`
} as const;

export const SUCCESS_MESSAGES = {
	PERSON_FOUND: (firstName: string, lastName: string) =>
		`Person found: ${firstName} ${lastName}`.trim(),
	PERSON_NOT_FOUND: (method: string, value: string) =>
		`No person found with ${method}: ${value}`,
	COMPANY_FOUND: (name: string) =>
		`Company found: ${name}`,
	COMPANY_NOT_FOUND: (method: string, value: string) =>
		`No company found with ${method}: ${value}`,
	OPPORTUNITY_FOUND: (name: string) =>
		`Opportunity found: ${name}`,
	OPPORTUNITY_NOT_FOUND: (method: string, value: string) =>
		`No opportunity found with ${method}: ${value}`
} as const;