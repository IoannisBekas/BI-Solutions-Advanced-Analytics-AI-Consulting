# Technical Documentation: BI Solutions App

## 1. Technology Stack

### Frontend
The frontend is a Single Page Application (SPA) built with modern React ecosystem tools.

*   **Framework**: **React** (v19) with **Vite** (v7) for build tooling.
*   **Language**: **TypeScript** (strict mode enabled).
*   **Styling**: **Tailwind CSS** (v4) for utility-first styling, with **PostCSS**.
*   **UI Components**:
    *   **Radix UI** primitives (dialogs, tabs, switch, etc.) for accessible, headless components.
    *   **Lucide React** for icons.
    *   **Framer Motion** for animations (page transitions, hover effects).
    *   **ScrollReveal** (custom wrapper) for scroll-triggered animations.
*   **Routing**: **Wouter** (lightweight alternative to React Router) using hash-based routing (`useHashLocation`).
*   **State Management & Data Fetching**: **TanStack Query** (React Query) for managing server state.
*   **Form Handling**: **React Hook Form** with **Zod** schema validation.
*   **Visualization**: **Recharts** for data charts.

### Backend
The backend is a Node.js server using Express.

*   **Runtime**: **Node.js**.
*   **Framework**: **Express.js**.
*   **Language**: **TypeScript** (`tsx` used for execution).
*   **API Structure**: REST-style JSON APIs.
*   **Authentication**: **Passport.js** (dependencies present, though currently not active in visible routes).
*   **WebSockets**: `ws` library included (likely for live updates, though usage not prominent in current routes).

## 2. APIs and Integrations

### Internal APIs
The frontend is configured to communicate with the backend via `/api/*` endpoints.
*   **Current Endpoint**: `/api/ai-advisor`
    *   **Method**: POST
    *   **Payload**: `{ role: string, question: string }`
    *   **Purpose**: Processes user questions based on a selected professional role (Accountant, Lawyer, Consultant).
    *   *Note: The backend implementation for this route appears to be missing in the current `server/routes.ts` file.*

### External Integrations
*   **OpenAI (Implied)**: The "AI Professional Advisor" feature is designed to use a Large Language Model (LLM). While `openai` is not listed in `dependencies` (possibly using `fetch` or a different client), the feature description ("Our AI, trained on Greek law...") implies an integration with a service like OpenAI's GPT models.
*   **Database Connection**: The project includes `@neondatabase/serverless` and `connect-pg-simple`, indicating integration with **Neon** (Serverless Postgres).

## 3. Data Storage and Privacy

### Database Architecture
*   **Primary DB**: **PostgreSQL**.
*   **ORM**: **Drizzle ORM** is used for type-safe database interactions.
*   **Schema**: a `users` table is defined in `shared/schema.ts` with:
    *   `id`: UUID
    *   `username`: Text (Unique)
    *   `password`: Text
*   **Migrations**: Managed via `drizzle-kit`.

### Current Storage State
*   **In-Memory Fallback**: The current code in `server/storage.ts` uses `MemStorage` (a Javascript Map). This means data is **not persistent** and is lost when the server restarts.
*   **Production Readiness**: For production, the `IStorage` interface should be implemented using the Drizzle/Postgres connection to ensure data persistence.

### Privacy Considerations
*   **Session Management**: `express-session` with `memorystore` is configured. In production, this should use a persistent store (like Redis or Postgres) to handle sessions securely.
*   **Data Handling**: User questions sent to the AI Advisor are currently not stored in the database schema provided. If they were to be stored, GDPR compliance would be required as they may contain personal information.

---

# OpenAI Specifics & Capabilities

## How it works (Conceptual Implementation)
Based on the "AI Advisor" feature, the integration works as follows:

1.  **User Input**: The user selects a persona (e.g., "Lawyer") and types a question.
2.  **API Request**: The frontend sends this data to the backend.
3.  **Prompt Engineering**: The backend (when implemented) constructs a prompt for the AI. For example:
    > "You are an expert Greek Lawyer. Answer the following question regarding Greek law: [User Question]"
4.  **Inference**: The prompt is sent to the OpenAI API (e.g., GPT-4o or GPT-3.5-turbo).
5.  **Response**: The text response is returned to the frontend and displayed.

## Does it cover Geometry Exercises?
**No.**

Based on the current codebase, there is **no support for geometry exercises**.

### Reasons:
1.  **Scope**: The current AI feature is explicitly strictly scoped to "Professional Roles" (Accountant, Lawyer, Consultant).
2.  **Input Type**: The input is text-only. Geometry exercises typically require **Visual Input** (images of shapes, angles, diagrams).
3.  **Model Usage**: To solve geometry problems effectively, the app would need to:
    *   Allow image uploads.
    *   Use **GPT-4o (Vision)** capabilities to analyze the image.
    *   Or use a specialized math solver API.

**To add Geometry support**, you would need to:
1.  Add an image upload feature to the frontend.
2.  Update the backend to accept input images.
3.  Integrate OpenAI's Vision API (sending the image + text prompt).
