import { INodeProperties } from 'n8n-workflow';
import { commonProperties } from './CommonProperties';
import { personProperties } from './PersonProperties';
import { companyProperties } from './CompanyProperties';
import { opportunityProperties } from './OpportunityProperties';
import { noteProperties } from './NoteProperties';
import { advancedProperties } from './AdvancedProperties';

/**
 * Builds the complete node properties configuration
 * @returns Array of all node properties organized by resource
 */
export function buildNodeProperties(): INodeProperties[] {
	return [
		...commonProperties,        // Resource selector
		...personProperties,        // Person-specific properties
		...companyProperties,       // Company-specific properties  
		...opportunityProperties,   // Opportunity-specific properties
		...noteProperties,          // Note-specific properties
		...advancedProperties,      // Advanced options - appears at the bottom
	];
}

// Export individual property sets for testing
export {
	commonProperties,
	personProperties,
	companyProperties,
	opportunityProperties,
	noteProperties,
	advancedProperties,
};