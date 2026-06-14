export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Mini Case Tracker API",
    version: "1.0.0",
    description:
      "JWT-secured API for managers and agents to create, assign, process, submit, and review client cases."
  },
  servers: [
    { url: "http://localhost:5000", description: "Local API" },
    { url: "https://your-render-service.onrender.com", description: "Render API" }
  ],
  tags: [
    { name: "Auth" },
    { name: "Users" },
    { name: "Cases" },
    { name: "Comments" },
    { name: "Documents" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: { type: "string", example: "Validation failed" },
          details: { type: "array", items: { type: "object" } }
        }
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "665b8f973227ad9ebd7d9d22" },
          name: { type: "string", example: "Maya Manager" },
          email: { type: "string", example: "manager@example.com" },
          role: { type: "string", enum: ["manager", "agent"], example: "manager" }
        }
      },
      Case: {
        type: "object",
        properties: {
          _id: { type: "string" },
          clientName: { type: "string", example: "Northstar Finance" },
          subjectName: { type: "string", example: "Rohan Mehta" },
          caseType: { type: "string", example: "Employment Verification" },
          dueDate: { type: "string", format: "date-time" },
          status: {
            type: "string",
            enum: ["New", "Assigned", "In Progress", "Submitted", "Cleared", "Discrepant"]
          },
          assignedAgent: { $ref: "#/components/schemas/User" },
          createdBy: { $ref: "#/components/schemas/User" },
          verdictNote: { type: "string" }
        }
      },
      Comment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          author: { $ref: "#/components/schemas/User" },
          message: { type: "string", example: "Documents requested from client." },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Document: {
        type: "object",
        properties: {
          _id: { type: "string" },
          originalName: { type: "string", example: "address-proof.pdf" },
          filename: { type: "string" },
          mimeType: { type: "string", example: "application/pdf" },
          size: { type: "number", example: 248000 },
          uploadedBy: { $ref: "#/components/schemas/User" }
        }
      },
      AuditLog: {
        type: "object",
        properties: {
          _id: { type: "string" },
          fromStatus: { type: "string", nullable: true },
          toStatus: { type: "string" },
          note: { type: "string" },
          actor: { $ref: "#/components/schemas/User" },
          createdAt: { type: "string", format: "date-time" }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Auth"],
        summary: "Health check",
        responses: {
          "200": { description: "API is running" }
        }
      }
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create an agent account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "role"],
                properties: {
                  name: { type: "string", example: "New Agent" },
                  email: { type: "string", example: "agent2@example.com" },
                  password: { type: "string", example: "Password123!" },
                  role: { type: "string", enum: ["agent"], example: "agent" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Account created and JWT returned" },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "manager@example.com" },
                  password: { type: "string", example: "Password123!" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "JWT and user returned" },
          "401": { description: "Invalid credentials" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Current user" },
          "401": { description: "Missing or expired token" }
        }
      }
    },
    "/api/users/agents": {
      get: {
        tags: ["Users"],
        summary: "List active agents",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Agents returned" },
          "403": { description: "Managers only" }
        }
      }
    },
    "/api/cases": {
      get: {
        tags: ["Cases"],
        summary: "List cases with search, filters, and pagination",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "agent", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10, minimum: 5, maximum: 50 } }
        ],
        responses: {
          "200": { description: "Paginated cases returned" }
        }
      },
      post: {
        tags: ["Cases"],
        summary: "Create a case as manager",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["clientName", "subjectName", "caseType", "dueDate"],
                properties: {
                  clientName: { type: "string", example: "Northstar Finance" },
                  subjectName: { type: "string", example: "Rohan Mehta" },
                  caseType: { type: "string", example: "Employment Verification" },
                  dueDate: { type: "string", format: "date", example: "2026-07-15" },
                  assignedAgent: { type: "string", nullable: true }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Case created" },
          "403": { description: "Managers only" }
        }
      }
    },
    "/api/cases/{id}": {
      get: {
        tags: ["Cases"],
        summary: "Get case details with comments, documents, and audit timeline",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Case detail returned" },
          "403": { description: "Agent can only access assigned cases" },
          "404": { description: "Case not found" }
        }
      }
    },
    "/api/cases/{id}/assign": {
      post: {
        tags: ["Cases"],
        summary: "Assign a New case to an agent",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["agentId"],
                properties: {
                  agentId: { type: "string" },
                  note: { type: "string", example: "Assigned to Aarav" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Case assigned" },
          "409": { description: "Invalid status transition" }
        }
      }
    },
    "/api/cases/{id}/start": {
      post: {
        tags: ["Cases"],
        summary: "Agent moves case from Assigned to In Progress",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Case started" } }
      }
    },
    "/api/cases/{id}/submit": {
      post: {
        tags: ["Cases"],
        summary: "Agent submits In Progress case for manager review",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Case submitted" }, "400": { description: "At least one document required" } }
      }
    },
    "/api/cases/{id}/review": {
      post: {
        tags: ["Cases"],
        summary: "Manager marks Submitted case as Cleared or Discrepant",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["verdict", "note"],
                properties: {
                  verdict: { type: "string", enum: ["Cleared", "Discrepant"] },
                  note: { type: "string", example: "All documents verified." }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Case reviewed" } }
      }
    },
    "/api/cases/{id}/comments": {
      post: {
        tags: ["Comments"],
        summary: "Add a comment to a case",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: { message: { type: "string", example: "Client confirmed the HR contact." } }
              }
            }
          }
        },
        responses: { "201": { description: "Comment created" } }
      }
    },
    "/api/cases/{id}/documents": {
      post: {
        tags: ["Documents"],
        summary: "Upload a supporting PDF or image",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: { type: "string", format: "binary" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Document uploaded" },
          "409": { description: "Case already submitted or closed" }
        }
      }
    }
  }
} as const;
