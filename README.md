# n8n-nodes-twenty-fork

[![npm version](https://badge.fury.io/js/n8n-nodes-twenty-fork.svg)](https://badge.fury.io/js/n8n-nodes-twenty-fork)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n community](https://img.shields.io/badge/n8n-community-orange.svg)](https://n8n.io/integrations/community-nodes/)

This is an advanced n8n community node that provides comprehensive **Twenty CRM** integration using modern GraphQL architecture. Originally forked from [n8n-nodes-twenty](https://github.com/shodgson/n8n-nodes-twenty) by S Hodgson, it has been completely rewritten with GraphQL-first approach and modular architecture by Matias Lopez.

[Twenty CRM](https://twenty.com/) is a modern open-source CRM platform. This node is compatible with **Twenty v1.4.0 and later**.

## 🚀 Key Features

- **🔄 GraphQL-First Architecture**: Uses Twenty's native GraphQL API for optimal performance
- **📊 4 Main Resources**: Complete CRUD operations for People, Companies, Opportunities, and Notes  
- **🔍 Unified Search**: Search by email, phone, custom fields with smart matching
- **✅ Robust Validation**: UUID validation, field resolution, and centralized error handling
- **🏗️ Modular Design**: Well-organized, maintainable codebase with TypeScript
- **🎯 Advanced Operations**: Create, Find, Update, Delete, List with filtering and pagination
- **🔗 Smart Relationships**: Automatic linking between People, Companies, and Opportunities
- **📝 Rich Note System**: Attach notes to any entity with full text support

## 📦 Installation

### For n8n
1. Go to **Settings** → **Community Nodes**
2. Install: `n8n-nodes-twenty-fork`

### Requirements
- **Twenty CRM** v1.4.0 or later
- **n8n** v0.140.0 or later
- **Node.js** 18.10 or later

## 🔧 Configuration

1. **Generate API Key**: In Twenty, go to **Settings** → **Developers** → **API Keys**
2. **Add Credentials**: In n8n, search for "Twenty API" credentials
3. **Configure**:
   - **API Key**: Your Twenty API key
   - **Domain**: Your Twenty instance URL (e.g., `https://app.twenty.com` or `http://localhost:3000`)
   - ⚠️ Do not include `/graphql` in the domain - the node handles this automatically

## 📋 Available Resources & Operations

| Resource | Operations | Description |
|----------|------------|-------------|
| **👤 Person** | Create, Find, Update, Delete, List by Company | Manage contacts with full profile data |
| **🏢 Company** | Create, Find, Update, Delete | Handle organizations and business entities |
| **💼 Opportunity** | Create, Find, Update, Delete, List | Track sales opportunities and deals |
| **📝 Note** | Create, Update, Delete, List | Attach notes to people, companies, or opportunities |

### Person Operations
- **Create**: Add new contacts with names, emails, phones, job titles, and company relationships
- **Find**: Search by email, phone, or custom fields with confidence scoring
- **Update**: Modify existing contact information using email or ID lookup
- **Delete**: Remove contacts by ID
- **List by Company**: Get all people associated with a specific company

### Company Operations  
- **Create**: Add companies with names, domains, addresses, and revenue information
- **Find**: Search by company name with fuzzy matching
- **Update**: Modify company details including contact information and financials
- **Delete**: Remove companies by ID

### Opportunity Operations
- **Create**: Add new sales opportunities with amounts, stages, and relationships  
- **Find**: Search opportunities by name or custom criteria
- **Update**: Modify deal information, stages, and amounts
- **Delete**: Remove opportunities by ID
- **List**: Get filtered lists of opportunities with pagination

### Note Operations
- **Create**: Attach notes to people, companies, or opportunities
- **Update**: Modify note content and titles
- **Delete**: Remove notes by ID  
- **List**: Get notes associated with specific entities

## 🏗️ Technical Architecture

### GraphQL Migration Benefits
- **Single Request Efficiency**: GraphQL queries fetch exactly the data needed
- **Type Safety**: Full TypeScript support with schema validation  
- **Future-Proof**: Aligned with Twenty's primary development direction
- **Better Error Handling**: Detailed GraphQL error messages and field validation
- **Optimized Performance**: Reduced network overhead compared to multiple REST calls

### Modular Code Organization
```
nodes/Twenty/
├── operations/          # Resource-specific business logic
│   ├── PersonOperations.ts
│   ├── CompanyOperations.ts  
│   ├── OpportunityOperations.ts
│   └── NoteOperations.ts
├── shared/             # Shared utilities and helpers
│   ├── ValidationUtils.ts
│   ├── ErrorHandler.ts
│   └── LoadOptionsUtils.ts
├── properties/         # n8n UI property definitions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── builders/           # Property builders for dynamic UI
└── GenericFunctions.ts # Core GraphQL infrastructure
```

### Smart Features
- **Field Resolution**: Automatic field name mapping and validation
- **Unified Search**: Consistent search interface across all resources  
- **UUID Validation**: Proper Twenty ID format validation
- **Custom Fields**: Support for custom field searches and updates
- **Relationship Handling**: Automatic entity linking and relationship management

## 🤝 Credits & Acknowledgments

### Original Creator
**[S Hodgson](https://github.com/shodgson)** - Original author of [n8n-nodes-twenty](https://github.com/shodgson/n8n-nodes-twenty)

The foundation of this work is built upon S Hodgson's excellent initial implementation. This fork extends and modernizes that work with GraphQL migration and enhanced architecture.

### Fork Maintainer  
**[Matias Lopez](https://github.com/qmatiaslopez)** - GraphQL migration, modern architecture, and ongoing maintenance

### Development Tools
- **[devlikeapro](https://github.com/devlikeapro)** - [n8n-openapi-node](https://github.com/devlikeapro/n8n-openapi-node) framework
- Built with assistance from **Claude Code** for documentation and development guidance

### What This Fork Adds
This fork transforms the original REST-based implementation into a modern, GraphQL-first solution:

- 🔄 **Complete GraphQL Migration**: Uses Twenty's native GraphQL API
- 🏗️ **Modern Architecture**: Modular, TypeScript-based design
- 🎯 **Enhanced Operations**: More comprehensive CRUD operations  
- 🔍 **Smart Search**: Advanced search capabilities with confidence scoring
- ✅ **Robust Validation**: Comprehensive error handling and field validation
- 📊 **Better UX**: Improved n8n integration with dynamic properties

## 🛠️ Compatibility

| Component | Version | Status |
|-----------|---------|--------|
| **Twenty CRM** | v1.4.0+ | ✅ Tested |
| **n8n** | v0.140.0+ | ✅ Supported |
| **Node.js** | 18.10+ | ✅ Required |

## 📚 Resources

- **[n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)**
- **[Twenty Developer Documentation](https://twenty.com/developers/)**  
- **[Twenty GraphQL API](https://twenty.com/developers/graphql-api)**
- **[Original n8n-nodes-twenty](https://github.com/shodgson/n8n-nodes-twenty)**

## 🐛 Issues & Support

For issues, feature requests, or questions:
- **GitHub Issues**: [Report here](https://github.com/qmatiaslopez/n8n-nodes-twenty/issues)
- **Twenty Community**: [Join discussions](https://twenty.com/community)
- **n8n Community**: [Get help](https://community.n8n.io/)

## 📄 License

MIT License - see [LICENSE.md](LICENSE.md) for details.

---

*This README was created with assistance from Claude Code for comprehensive documentation.*
