# n8n-nodes-twenty-fork

> **v1.0.0 Major Update**: Complete migration from REST to GraphQL! This version now uses Twenty's native GraphQL API for better performance and reliability.

This is an n8n community node that lets you use **Twenty CRM** in your n8n workflows. Originally forked from [n8n-nodes-twenty](https://github.com/shodgson/n8n-nodes-twenty) by S Hodgson, completely rewritten for GraphQL by Matias Lopez.

[Twenty CRM](https://twenty.com/) is an open-source CRM (customer relationship management) tool. This node is compatible with **Twenty v1.4.0 and later**.

## 🚀 Version 1.0.0 Highlights

- **🔄 Complete GraphQL Migration**: All operations now use Twenty's primary GraphQL API
- **⚡ Better Performance**: Single GraphQL requests vs multiple REST calls
- **🛡️ Improved Reliability**: Uses Twenty's main API (same as their frontend)
- **🔮 Future-Proof**: Aligned with Twenty's development direction
- **✨ Zero Breaking Changes**: Same n8n interface, seamless upgrade

### API Evolution

| Version | API Type | Endpoint | Status |
|---------|----------|----------|---------|
| v0.x | REST | `/rest/core/*` | Legacy |
| **v1.0.0** | **GraphQL** | **`/graphql`** | **✅ Current** |

### What's New in v1.0.0

- 🔄 **GraphQL-First**: All CRUD operations use GraphQL mutations and queries
- 🎯 **Better Error Handling**: GraphQL provides more detailed error messages  
- 📊 **Optimized Queries**: Fetch exactly the data you need
- 🔒 **Type Safety**: Full TypeScript support with GraphQL schema validation
- 🚀 **Performance**: Reduced network overhead with single requests

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Resources](#resources)  
[Credit](#credit)  
[Version history](#version-history)  

## Installation

### For n8n Cloud
1. Go to Settings → Community Nodes
2. Install: `n8n-nodes-twenty-fork`

### For Self-hosted n8n
```bash
npm install n8n-nodes-twenty-fork
```

### Requirements
- Twenty CRM v1.4.0 or later
- n8n v0.140.0 or later

### Migration from Original
If you're currently using the original `n8n-nodes-twenty`:
1. Ensure your Twenty instance is v1.4.0+
2. Uninstall: `npm uninstall n8n-nodes-twenty`  
3. Install fork: `npm install n8n-nodes-twenty-fork`
4. No workflow changes needed - same node interface

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation for more details.

## Operations
	- General
	- Api Keys
	- Attachments
	- Blocklists
	- Calendar Channel Event Associations
	- Calendar Channels
	- Calendar Event Participants
	- Calendar Events
	- Companies
	- Connected Accounts
	- Favorite Folders
	- Favorites
	- Message Channel Message Associations
	- Message Channels
	- Message Folders
	- Message Participants
	- Messages
	- Message Threads
	- Notes
	- Note Targets
	- Opportunities
	- People
	- Tasks
	- Task Targets
	- Timeline Activities
	- View Fields
	- View Filter Groups
	- View Filters
	- View Groups
	- Views
	- View Sorts
	- Webhooks
	- Workflow Automated Triggers
	- Workflow Runs
	- Workflows
	- Workflow Versions
	- Workspace Members

## Credentials

Generate an API key in Twenty by following the [Twenty docs](https://twenty.com/developers). In summary, create an API key in the Settings → Playground section.

Copy the API key. Click 'Add Credential' in n8n and search for 'Twenty API'. Provide the API key and your Twenty domain (e.g. http://localhost:3000, https://app.twenty.com). Do _not_ include the API path - the node will automatically use the correct endpoints.

## Compatibility

**BREAKING CHANGE:** This version requires Twenty v1.4.0 or later. For older versions of Twenty, use n8n-nodes-twenty v0.0.5 instead.

Compatible and tested with Twenty v1.4.0 and n8n v1.91.3+.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Twenty developer documentation](https://twenty.com/developers/)

## Version history

### Fork Version History

#### v1.0.0 🚀 (Major GraphQL Migration)
**Complete migration from REST to GraphQL API**
- ✅ **GraphQL-First**: All operations use Twenty's primary GraphQL API
- ✅ **Zero Breaking Changes**: Same n8n interface, seamless upgrade
- ✅ **Better Performance**: Single GraphQL requests vs multiple REST calls  
- ✅ **Improved Reliability**: Uses Twenty's main API (same as frontend)
- ✅ **Future-Proof**: Aligned with Twenty's development direction
- ✅ **Enhanced Error Handling**: Better GraphQL error messages
- ✅ **Type Safety**: Full TypeScript support with schema validation

#### v0.6.9 (REST Era - Final)
Added comprehensive field resolution system with fallback mechanisms and enhanced custom field support with improved error handling for unknown fields.

#### v0.1.0 (Fork by Matias Lopez)
**BREAKING CHANGE:** Forked for Twenty v1.4.0 compatibility
- Updated API endpoints from `/rest/*` to `/rest/core/*`
- Added support for metadata API at `/rest/metadata/*`
- Enhanced filtering with advanced operators (`and`, `or`, `not`)
- Improved cursor-based pagination
- Updated OpenAPI schema for v1.4.0 features
- NOT compatible with Twenty versions < v1.4.0
- Fork of original work by S Hodgson

### Original Version History

#### v0.0.5 (Original by S Hodgson)
Simplified to build on n8n-openapi-node (Last version compatible with Twenty < v1.4.0)

#### v0.0.4
Compatible with Twenty's updated API in v0.40.7

#### v0.0.3
Compatible with Twenty's updated API in v0.33.4

#### v0.0.1
Initial release

## Credits & Attribution

### Original Work
- **S Hodgson** - Original creator of [n8n-nodes-twenty](https://github.com/shodgson/n8n-nodes-twenty)
- **devlikeapro** - [n8n-openapi-node](https://github.com/devlikeapro/n8n-openapi-node) framework
- Previous versions relied on similar tools from [ivov](https://github.com/ivov) and [feelgood-interface](https://github.com/feelgood-interface)

### Fork Maintainer
- **Matias Lopez** - v1.4.0 compatibility and v1.0.0 GraphQL migration

### What This Fork Adds
This fork builds upon S Hodgson's excellent foundation by adding:
- **v1.0.0**: Complete migration to Twenty's GraphQL API
- **v0.x**: Updated API endpoints for Twenty v1.4.0+
- **v0.x**: Metadata API integration  
- **v0.x**: Enhanced filtering and pagination
- **v0.x**: Modern OpenAPI schema integration

