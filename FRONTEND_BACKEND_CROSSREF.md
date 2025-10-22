# Nibble: Frontend-Backend Cross-Reference

**Generated:** October 21, 2025  
**Backend:** `/Users/vivienhuang/6.1040/nibble-backend` (Deno + Hono)  
**Frontend:** `/Users/vivienhuang/6.1040/nibble-frontend` (Vue 3 + TypeScript + Pinia)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Summary](#architecture-summary)
3. [API Endpoints Coverage](#api-endpoints-coverage)
4. [Type Definitions Comparison](#type-definitions-comparison)
5. [State Management](#state-management)
6. [Response Format Inconsistencies](#response-format-inconsistencies)
7. [Missing Implementations](#missing-implementations)
8. [Recommendations](#recommendations)

---

## Overview

This document provides a comprehensive cross-reference between the **nibble-backend** and **nibble-frontend** repositories. It analyzes API coverage, type consistency, data flow patterns, and identifies potential issues or inconsistencies.

### Key Stats

- **Backend Concepts:** 7 (User, Recipe, Version, VersionDraft, Annotation, Notebook, Step)
- **API Endpoints Defined:** 41
- **Frontend Stores:** 5 (auth, recipe, version, notebook, annotation)
- **Frontend Services:** 6 API modules matching backend concepts
- **API Base URL:** `http://localhost:8000/api`

---

## Architecture Summary

### Backend Architecture

```
nibble-backend/
├── src/
│   ├── concept_server.ts          # Hono server with dynamic concept routing
│   ├── concepts/                   # Concept implementations
│   │   ├── User/UserConcept.ts
│   │   ├── Recipe/RecipeConcept.ts
│   │   ├── Version/VersionConcept.ts
│   │   ├── VersionDraft/VersionDraftConcept.ts
│   │   ├── Annotation/AnnotationConcept.ts
│   │   ├── Notebook/NotebookConcept.ts
│   │   ├── Ingredient.ts           # Value object (no endpoints)
│   │   └── Step.ts                 # Value object (no endpoints)
│   └── utils/
│       ├── database.ts             # MongoDB connection
│       └── types.ts                # Shared type definitions
└── api-spec.md                     # Complete API specification
```

**Tech Stack:**

- Runtime: Deno
- Web Framework: Hono
- Database: MongoDB
- Port: 8000

### Frontend Architecture

```
nibble-frontend/
├── src/
│   ├── services/
│   │   └── api.ts                  # API client layer
│   ├── stores/                     # Pinia state management
│   │   ├── auth.ts
│   │   ├── recipe.ts
│   │   ├── version.ts
│   │   ├── notebook.ts
│   │   └── annotation.ts
│   ├── types/
│   │   └── api.ts                  # TypeScript type definitions
│   ├── components/                 # Vue components
│   ├── views/                      # Page components
│   └── router/                     # Vue Router
└── api-spec.md                     # Copy of backend API spec
```

**Tech Stack:**

- Framework: Vue 3 (Composition API)
- State Management: Pinia
- Language: TypeScript
- Build Tool: Vite
- Development Port: Proxied to backend :8000

---

## API Endpoints Coverage

### ✅ User Concept

| Endpoint                           | Backend | Frontend | Store   | Notes                   |
| ---------------------------------- | ------- | -------- | ------- | ----------------------- |
| `POST /api/User/registerUser`      | ✅      | ✅       | auth.ts | Used for registration   |
| `POST /api/User/login`             | ✅      | ✅       | auth.ts | Used for authentication |
| `POST /api/User/updateProfile`     | ✅      | ✅       | auth.ts | Profile updates         |
| `POST /api/User/_getUserDetails`   | ✅      | ✅       | auth.ts | Called after login      |
| `POST /api/User/_getUserIDByEmail` | ✅      | ✅       | auth.ts | User lookup             |

**Coverage:** 5/5 (100%)

### ✅ Recipe Concept

| Endpoint                               | Backend | Frontend | Store     | Notes                |
| -------------------------------------- | ------- | -------- | --------- | -------------------- |
| `POST /api/Recipe/createRecipe`        | ✅      | ✅       | recipe.ts | Create new recipe    |
| `POST /api/Recipe/addTag`              | ✅      | ✅       | recipe.ts | Tag management       |
| `POST /api/Recipe/removeTag`           | ✅      | ✅       | recipe.ts | Tag management       |
| `POST /api/Recipe/deleteRecipe`        | ✅      | ✅       | recipe.ts | Recipe deletion      |
| `POST /api/Recipe/updateRecipeDetails` | ✅      | ✅       | recipe.ts | Update recipe fields |
| `POST /api/Recipe/_getRecipeById`      | ✅      | ✅       | recipe.ts | Load single recipe   |
| `POST /api/Recipe/_listRecipesByOwner` | ✅      | ✅       | recipe.ts | List user's recipes  |
| `POST /api/Recipe/_searchRecipesByTag` | ✅      | ✅       | recipe.ts | Tag-based search     |

**Coverage:** 8/8 (100%)

### ✅ Version Concept

| Endpoint                                  | Backend | Frontend | Store      | Notes                    |
| ----------------------------------------- | ------- | -------- | ---------- | ------------------------ |
| `POST /api/Version/createVersion`         | ✅      | ✅       | version.ts | Create immutable version |
| `POST /api/Version/deleteVersion`         | ✅      | ✅       | version.ts | Delete version           |
| `POST /api/Version/draftVersionWithAI`    | ✅      | ✅       | version.ts | AI-assisted drafting     |
| `POST /api/Version/approveDraft`          | ✅      | ✅       | version.ts | Approve AI draft         |
| `POST /api/Version/rejectDraft`           | ✅      | ✅       | version.ts | Reject AI draft          |
| `POST /api/Version/_getVersionById`       | ✅      | ✅       | version.ts | Load single version      |
| `POST /api/Version/_listVersionsByRecipe` | ✅      | ✅       | version.ts | List recipe versions     |
| `POST /api/Version/_listVersionsByAuthor` | ✅      | ✅       | version.ts | List author versions     |

**Coverage:** 8/8 (100%)

### ✅ VersionDraft Concept

| Endpoint                                        | Backend | Frontend | Store        | Notes                  |
| ----------------------------------------------- | ------- | -------- | ------------ | ---------------------- |
| `POST /api/VersionDraft/createDraft`            | ✅      | ✅       | version.ts\* | Create transient draft |
| `POST /api/VersionDraft/deleteDraft`            | ✅      | ✅       | version.ts\* | Delete draft           |
| `POST /api/VersionDraft/_getDraftById`          | ✅      | ✅       | version.ts\* | Load single draft      |
| `POST /api/VersionDraft/_listDraftsByRequester` | ✅      | ✅       | version.ts\* | List user drafts       |
| `POST /api/VersionDraft/_cleanupExpiredDrafts`  | ✅      | ✅       | version.ts\* | System cleanup         |

\*Note: VersionDraft API calls are available via `versionDraftApi` in services/api.ts

**Coverage:** 5/5 (100%)

### ✅ Annotation Concept

| Endpoint                                        | Backend | Frontend | Store         | Notes                    |
| ----------------------------------------------- | ------- | -------- | ------------- | ------------------------ |
| `POST /api/Annotation/annotate`                 | ✅      | ✅       | annotation.ts | Create annotation        |
| `POST /api/Annotation/editAnnotation`           | ✅      | ✅       | annotation.ts | Edit annotation text     |
| `POST /api/Annotation/resolveAnnotation`        | ✅      | ✅       | annotation.ts | Mark resolved/unresolved |
| `POST /api/Annotation/deleteAnnotation`         | ✅      | ✅       | annotation.ts | Delete annotation        |
| `POST /api/Annotation/_getAnnotationsForRecipe` | ✅      | ✅       | annotation.ts | List recipe annotations  |
| `POST /api/Annotation/_getAnnotationById`       | ✅      | ✅       | annotation.ts | Load single annotation   |

**Coverage:** 6/6 (100%)

### ✅ Notebook Concept

| Endpoint                                           | Backend | Frontend | Store       | Notes                       |
| -------------------------------------------------- | ------- | -------- | ----------- | --------------------------- |
| `POST /api/Notebook/createNotebook`                | ✅      | ✅       | notebook.ts | Create notebook             |
| `POST /api/Notebook/inviteMember`                  | ✅      | ✅       | notebook.ts | Add member                  |
| `POST /api/Notebook/removeMember`                  | ✅      | ✅       | notebook.ts | Remove member               |
| `POST /api/Notebook/shareRecipe`                   | ✅      | ✅       | notebook.ts | Share recipe to notebook    |
| `POST /api/Notebook/unshareRecipe`                 | ✅      | ✅       | notebook.ts | Remove recipe from notebook |
| `POST /api/Notebook/deleteNotebook`                | ✅      | ✅       | notebook.ts | Delete notebook             |
| `POST /api/Notebook/_getNotebookById`              | ✅      | ✅       | notebook.ts | Load single notebook        |
| `POST /api/Notebook/_getNotebooksByOwner`          | ✅      | ✅       | notebook.ts | List user's notebooks       |
| `POST /api/Notebook/_getNotebooksContainingRecipe` | ✅      | ✅       | notebook.ts | Find notebooks with recipe  |

**Coverage:** 9/9 (100%)

### 📝 Step & Ingredient Concepts

These are **value objects** (embedded types) and do not expose independent API endpoints. They are managed through Recipe and Version concepts.

---

## Type Definitions Comparison

### Shared Types

Both frontend and backend share similar type definitions for:

- `User`, `Recipe`, `Version`, `VersionDraft`, `Annotation`, `Notebook`
- `Ingredient`, `Step`
- Request/Response types

### Key Differences

| Type                 | Backend (implied)           | Frontend (explicit) | Notes         |
| -------------------- | --------------------------- | ------------------- | ------------- |
| `ID`                 | `string` (MongoDB ObjectID) | `type ID = string`  | ✅ Compatible |
| `Recipe._id`         | MongoDB `_id`               | `_id: ID`           | ✅ Compatible |
| `Recipe.ingredients` | `Ingredient[]`              | `Ingredient[]`      | ✅ Compatible |
| `Recipe.steps`       | `Step[]`                    | `Step[]`            | ✅ Compatible |
| `Recipe.tags`        | `string[]`                  | `string[]`          | ✅ Compatible |
| Dates                | ISO 8601 strings            | `string` (ISO 8601) | ✅ Compatible |

### Frontend Type Definitions (`src/types/api.ts`)

```typescript
export type ID = string;

export interface User {
  _id: ID;
  name: string;
  email: string;
  preferences: Record<string, unknown>;
}

export interface Recipe {
  _id: ID;
  owner: ID;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  created: string; // ISO 8601
  updated: string; // ISO 8601
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
  notes?: string;
}

export interface Step {
  description: string;
  duration?: number;
  notes?: string;
}

// ... more types for Version, Annotation, Notebook, etc.
```

**Assessment:** ✅ Types are well-aligned between frontend and backend specifications.

---

## State Management

The frontend uses **Pinia stores** for reactive state management. Each store corresponds to a backend concept.

### Store Structure Pattern

All stores follow a consistent pattern:

```typescript
defineStore(name, () => {
  // State
  const items = ref<T[]>([]);
  const currentItem = ref<T | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const derivedData = computed(() => { ... });

  // Actions (async)
  async function loadItems() { ... }
  async function createItem() { ... }
  async function updateItem() { ... }
  async function deleteItem() { ... }

  return { items, currentItem, isLoading, error, ... };
});
```

### Store Dependencies

```
auth.ts (root)
  ├─> recipe.ts (depends on auth.userId)
  ├─> version.ts (depends on auth.userId)
  ├─> annotation.ts (depends on auth.userId)
  └─> notebook.ts (depends on auth.userId)
```

### Authentication Flow

```typescript
// 1. User logs in
await authStore.login(email, password)
  ↓
// 2. Backend returns user ID
{ user: "67123abc..." }
  ↓
// 3. Frontend fetches user details
await userApi.getUserDetails(userId)
  ↓
// 4. User stored in localStorage + Pinia store
localStorage.setItem('currentUser', JSON.stringify(user))
currentUser.value = user
```

---

## Response Format Inconsistencies

### ⚠️ Issue: Query Response Wrapping

**Backend Specification:**

```json
// Query endpoints return arrays
[
  { "recipe": { ...recipeData } }
]
```

**Actual Backend Implementation:**

```json
// Some endpoints may return direct arrays
[
  { _id: "...", title: "...", ... }
]
```

**Frontend Handling:**
The frontend has defensive code to handle multiple response formats:

```typescript:recipe.ts
// loadRecipeById handles multiple response structures
let recipe: Recipe | undefined;
if (Array.isArray(response)) {
  recipe = response[0];
} else if (response.recipe) {
  if (Array.isArray(response.recipe)) {
    recipe = response.recipe[0];
  } else {
    recipe = response.recipe;
  }
} else {
  recipe = response;
}
```

**Recommendation:** Standardize response formats in backend to match API spec exactly.

### ⚠️ Issue: User Details Response

**Expected (per API spec):**

```json
[
  {
    "user": {
      "name": "...",
      "email": "...",
      "preferences": {}
    }
  }
]
```

**Frontend receives:**

```json
// Might be nested or direct
```

**Current workaround in frontend:**

```typescript:auth.ts
const userArray = userDetails as User[];
const userData = userArray[0];
const user = userData.user || userData; // Handle both formats
if (!user._id) {
  user._id = userId; // Inject _id if missing
}
```

---

## Missing Implementations

### ❌ Backend Issues

1. **No CORS configuration visible** - Frontend may need proxy in development
2. **No authentication middleware** - All endpoints are currently open (no JWT/session management)
3. **No request validation layer** - Relying on TypeScript types only
4. **No rate limiting** - API is unprotected

### ⚠️ Frontend Issues

1. **No error boundary components** - API errors only shown in store error state
2. **No retry logic** - Failed requests don't retry
3. **No offline support** - No service worker or caching
4. **No optimistic updates** - All UI waits for server response
5. **localStorage security** - User data stored in plaintext

### 📝 Feature Gaps

Neither frontend nor backend implement:

- **Real-time updates** (WebSocket/SSE for collaborative editing)
- **File uploads** (for recipe images)
- **Pagination** (all list endpoints return full arrays)
- **Sorting/filtering** (done client-side only)
- **Bulk operations** (delete multiple, move multiple, etc.)

---

## Recommendations

### High Priority

1. **✅ Standardize Response Formats**

   - Backend should strictly follow API spec for query responses
   - Remove defensive parsing code from frontend once stable

2. **🔐 Add Authentication Middleware**

   - Implement JWT or session-based auth on backend
   - Add Authorization header to all frontend requests
   - Secure localStorage with encryption or switch to httpOnly cookies

3. **🛡️ Add Request Validation**

   - Backend: Use Zod or similar for runtime validation
   - Return 400 errors with detailed validation messages
   - Frontend: Add client-side validation before API calls

4. **📄 Add Pagination**
   - Especially for `listRecipesByOwner`, `listVersionsByRecipe`
   - Add `limit` and `offset` parameters
   - Frontend: Implement infinite scroll or page controls

### Medium Priority

5. **🔄 Add Retry Logic**

   - Frontend: Retry failed requests with exponential backoff
   - Differentiate between retryable (5xx) and non-retryable (4xx) errors

6. **🎨 Improve Error Handling**

   - Backend: Return structured error objects with error codes
   - Frontend: Add toast notifications or error boundary components
   - Show user-friendly messages instead of raw API errors

7. **⚡ Add Optimistic Updates**

   - Frontend: Update UI immediately, rollback on error
   - Especially for tag add/remove, annotation toggle

8. **📊 Add Analytics & Monitoring**
   - Track API usage, errors, performance
   - Add logging on both frontend (Sentry) and backend

### Low Priority

9. **🌐 Add Internationalization (i18n)**

   - Support multiple languages
   - Translate error messages, UI text

10. **🖼️ Add Rich Features**
    - Recipe image upload/storage
    - Export recipes (PDF, JSON)
    - Recipe import from URLs
    - Recipe ratings/favorites

---

## Testing Coverage

### Backend

- Test files exist for all concepts (`*Concept.test.ts`)
- No visibility into actual test coverage

### Frontend

- Minimal test coverage (only `HelloWorld.spec.ts` in components)
- No store tests
- No API integration tests

**Recommendation:** Add comprehensive test suites for both frontend and backend.

---

## Deployment Checklist

### Backend

- [ ] Set up production MongoDB instance
- [ ] Configure environment variables
- [ ] Add authentication middleware
- [ ] Add request validation
- [ ] Set up CORS for production domain
- [ ] Add rate limiting
- [ ] Set up logging/monitoring
- [ ] Add health check endpoint
- [ ] Configure HTTPS

### Frontend

- [ ] Configure production API URL
- [ ] Build production bundle (`npm run build`)
- [ ] Test with production backend
- [ ] Set up CDN for static assets
- [ ] Configure HTTPS
- [ ] Add error tracking (e.g., Sentry)
- [ ] Add analytics (optional)
- [ ] Test on multiple browsers/devices

---

## Conclusion

### ✅ Strengths

1. **Complete API Coverage** - Frontend implements 100% of backend endpoints
2. **Type Safety** - Strong TypeScript types on frontend
3. **Consistent Architecture** - Clear separation of concerns (services, stores, components)
4. **Concept-Driven Design** - Backend cleanly organized by concepts
5. **Comprehensive API Spec** - Detailed documentation in `api-spec.md`

### ⚠️ Areas for Improvement

1. **Response Format Consistency** - Backend responses don't always match spec
2. **Authentication** - No secure auth implementation
3. **Error Handling** - Limited error handling on both sides
4. **Testing** - Minimal test coverage
5. **Production Readiness** - Missing essential features (pagination, validation, etc.)

### 📈 Next Steps

1. Fix response format inconsistencies in backend
2. Implement JWT-based authentication
3. Add request validation with Zod
4. Write comprehensive tests
5. Add pagination to list endpoints
6. Improve error handling and user feedback
7. Prepare for production deployment

---

**Document Version:** 1.0  
**Last Updated:** October 21, 2025  
**Maintained By:** Cross-reference generated by AI assistant
