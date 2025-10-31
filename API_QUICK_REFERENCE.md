# Nibble API Quick Reference

## 🔗 Endpoint Summary

**Base URL:** `http://localhost:8000/api`  
**Method:** All endpoints use `POST` with JSON bodies

---

## 👤 User

```bash
# Register new user
POST /api/User/registerUser
{ "name": "string", "username": "string", "password": "string" }
→ { "user": "ID" }

# Login
POST /api/User/login
{ "username": "string", "password": "string" }
→ { "user": "ID" }

# Update profile
POST /api/User/updateProfile
{ "user": "ID", "newName": "string", "newUsername": "string", "newPreferences": {} }
→ {}

# Get user details
POST /api/User/_getUserDetails
{ "user": "ID" }
→ [{ "user": { "name": "string", "username": "string", "preferences": {} } }]

# Get user ID by username
POST /api/User/_getUserIDByUsername
{ "username": "string" }
→ [{ "user": "ID" }]
```

---

## 🍳 Recipe

```bash
# Create recipe (optionally fork from another)
POST /api/Recipe/createRecipe
{
  "owner": "ID",
  "title": "string",
  "ingredients": [{ "name": "string", "quantity": "string" }],
  "steps": [{ "description": "string" }],
  "description": "string",
  "forkedFrom": "ID (optional)"
}
→ { "recipe": "ID" }

# Update recipe
POST /api/Recipe/updateRecipeDetails
{
  "owner": "ID",
  "recipe": "ID",
  "newTitle": "string",
  "newDescription": "string",
  "newIngredients": [...],
  "newSteps": [...]
}
→ {}

# Add tag
POST /api/Recipe/addTag
{ "recipe": "ID", "tag": "string" }
→ {}

# Remove tag
POST /api/Recipe/removeTag
{ "recipe": "ID", "tag": "string" }
→ {}

# Delete recipe
POST /api/Recipe/deleteRecipe
{ "requester": "ID", "recipe": "ID" }
→ {}

# Get recipe by ID
POST /api/Recipe/_getRecipeById
{ "recipe": "ID" }
→ [{ "recipe": { ...recipeData } }]

# List recipes by owner
POST /api/Recipe/_listRecipesByOwner
{ "owner": "ID" }
→ [{ "recipe": { ...recipeData } }, ...]

# Search recipes by tag
POST /api/Recipe/_searchRecipesByTag
{ "tag": "string" }
→ [{ "recipe": { ...recipeData } }, ...]

# Get fork count
POST /api/Recipe/_getForkCount
{ "recipe": "ID" }
→ { "count": number }

# List forks of a recipe
POST /api/Recipe/_listForksOfRecipe
{ "recipe": "ID" }
→ [{ "recipe": { ...recipeData } }, ...]

# 🤖 AI: Draft recipe modifications
POST /api/Recipe/draftRecipeWithAI
{ "author": "ID", "recipe": "ID", "goal": "string" }
→ { "draftId": "ID", "ingredients": [...], "steps": [...], "notes": "string", "confidence": 0.85, ... }

# 🤖 AI: Apply approved draft to recipe
POST /api/Recipe/applyDraft
{ "owner": "ID", "recipe": "ID", "draftDetails": { "ingredients": [...], "steps": [...], "notes": "string" } }
→ {}
```

---

## 💬 Annotation

```bash
# Create annotation
POST /api/Annotation/annotate
{
  "author": "string",
  "recipe": "string",
  "targetKind": "Ingredient" | "Step",
  "index": number,
  "text": "string"
}
→ { "annotation": "string" }

# Edit annotation
POST /api/Annotation/editAnnotation
{ "author": "string", "annotation": "string", "newText": "string" }
→ {}

# Resolve annotation
POST /api/Annotation/resolveAnnotation
{ "resolver": "string", "annotation": "string", "resolved": boolean }
→ {}

# Delete annotation
POST /api/Annotation/deleteAnnotation
{ "author": "string", "annotation": "string" }
→ {}

# Get annotations for recipe
POST /api/Annotation/_getAnnotationsForRecipe
{ "recipe": "string" }
→ [{ "annotation": { ... } }, ...]

# Get annotation by ID
POST /api/Annotation/_getAnnotationById
{ "annotation": "string" }
→ [{ "annotation": { ... } }]
```

---

## 📔 Notebook

```bash
# Create notebook
POST /api/Notebook/createNotebook
{ "owner": "ID", "title": "string", "description": "string" }
→ { "notebook": "ID" }

# Invite member
POST /api/Notebook/inviteMember
{ "owner": "ID", "notebook": "ID", "member": "ID" }
→ {}

# Remove member
POST /api/Notebook/removeMember
{ "owner": "ID", "notebook": "ID", "member": "ID" }
→ {}

# Share recipe
POST /api/Notebook/shareRecipe
{ "sharer": "ID", "recipe": "ID", "notebook": "ID" }
→ {}

# Unshare recipe
POST /api/Notebook/unshareRecipe
{ "requester": "ID", "recipe": "ID", "notebook": "ID" }
→ {}

# Delete notebook
POST /api/Notebook/deleteNotebook
{ "owner": "ID", "notebook": "ID" }
→ {}

# Get notebook by ID
POST /api/Notebook/_getNotebookById
{ "notebook": "ID" }
→ [{ "_id": "ID", "owner": "ID", "title": "string", ... }]

# Get notebooks by owner
POST /api/Notebook/_getNotebooksByOwner
{ "owner": "ID" }
→ [{ "_id": "ID", "owner": "ID", ... }, ...]

# Get notebooks containing recipe
POST /api/Notebook/_getNotebooksContainingRecipe
{ "recipe": "ID" }
→ [{ "_id": "ID", "owner": "ID", "recipes": ["ID"], ... }, ...]
```

---

## 🔍 Frontend Service Mapping

| Concept      | Frontend Service  | Export Name       |
| ------------ | ----------------- | ----------------- |
| User         | `services/api.ts` | `userApi`         |
| Recipe       | `services/api.ts` | `recipeApi`       |
| Version      | `services/api.ts` | `versionApi`      |
| VersionDraft | `services/api.ts` | `versionDraftApi` |
| Annotation   | `services/api.ts` | `annotationApi`   |
| Notebook     | `services/api.ts` | `notebookApi`     |

### Example Usage

```typescript
import { recipeApi } from "@/services/api";

// Create a recipe
const response = await recipeApi.createRecipe({
  owner: userId,
  title: "Chocolate Chip Cookies",
  ingredients: [
    { name: "flour", quantity: "2 cups" },
    { name: "sugar", quantity: "1 cup" },
  ],
  steps: [
    { description: "Mix ingredients" },
    { description: "Bake at 350°F for 12 minutes" },
  ],
  description: "Classic chocolate chip cookies",
});

const newRecipeId = response.recipe;
```

---

## 📦 Frontend Store Mapping

| Concept    | Pinia Store            | File                   |
| ---------- | ---------------------- | ---------------------- |
| User       | `useAuthStore()`       | `stores/auth.ts`       |
| Recipe     | `useRecipeStore()`     | `stores/recipe.ts`     |
| Version    | `useVersionStore()`    | `stores/version.ts`    |
| Annotation | `useAnnotationStore()` | `stores/annotation.ts` |
| Notebook   | `useNotebookStore()`   | `stores/notebook.ts`   |

### Example Usage

```typescript
import { useRecipeStore } from '@/stores/recipe';

const recipeStore = useRecipeStore();

// Load user's recipes
await recipeStore.loadUserRecipes();

// Access reactive data
const recipes = recipeStore.recipes;
const currentRecipe = recipeStore.currentRecipe;
const isLoading = recipeStore.isLoading;
const error = recipeStore.error;

// Create a recipe (auto-injects userId from authStore)
const newRecipeId = await recipeStore.createRecipe({
  title: 'New Recipe',
  ingredients: [...],
  steps: [...]
});
```

---

## 🔐 Authentication Flow

```
1. User fills login form
   ↓
2. Frontend: authStore.login(email, password)
   ↓
3. POST /api/User/login → { user: "ID" }
   ↓
4. POST /api/User/_getUserDetails → [{ user: { name, email, ... } }]
   ↓
5. Store user in:
   - Pinia: authStore.currentUser
   - localStorage: 'currentUser'
   ↓
6. Other stores use: authStore.userId
   ↓
7. On page refresh: initializeAuth() reads from localStorage
```

---

## 🎯 Common Patterns

### Creating a Resource

```typescript
// Pattern: Create → Refresh list
const newId = await store.createItem(data);
await store.loadItems(); // Refresh list
```

### Updating a Resource

```typescript
// Pattern: Update → Refresh single item
await store.updateItem(itemId, updates);
await store.loadItemById(itemId); // Refresh item
```

### Deleting a Resource

```typescript
// Pattern: Delete → Update local state
await store.deleteItem(itemId);
// Store automatically removes from local array
```

### Loading with Error Handling

```typescript
try {
  await store.loadItems();
} catch (error) {
  // Error already captured in store.error
  console.error(store.error);
}
```

---

## ⚠️ Known Issues

1. **Response Format Inconsistency**

   - Backend may return direct arrays instead of wrapped objects
   - Frontend has defensive parsing to handle both formats

2. **No Authentication Tokens**

   - Currently no JWT or session tokens
   - All endpoints are publicly accessible

3. **No Pagination**

   - All list endpoints return complete arrays
   - May cause performance issues with large datasets

4. **Optimistic Updates**
   - Most operations wait for server response
   - UI may feel slow for tag add/remove

---

## 🚀 Testing Endpoints (curl)

```bash
# Register a user
curl -X POST http://localhost:8000/api/User/registerUser \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/User/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create a recipe (replace USER_ID)
curl -X POST http://localhost:8000/api/Recipe/createRecipe \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "USER_ID",
    "title": "Test Recipe",
    "ingredients": [{"name":"flour","quantity":"2 cups"}],
    "steps": [{"description":"Mix and bake"}],
    "description": "A test recipe"
  }'

# List recipes by owner (replace USER_ID)
curl -X POST http://localhost:8000/api/Recipe/_listRecipesByOwner \
  -H "Content-Type: application/json" \
  -d '{"owner":"USER_ID"}'
```

---

## 📚 Additional Resources

- **Full API Spec:** See `api-spec.md` for complete documentation
- **Frontend Types:** See `nibble-frontend/src/types/api.ts`
- **Backend Concepts:** See `nibble-backend/src/concepts/`
- **Cross Reference:** See `FRONTEND_BACKEND_CROSSREF.md`

---

**Last Updated:** October 21, 2025
