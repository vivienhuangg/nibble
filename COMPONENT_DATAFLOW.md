# Nibble Frontend: Component & Data Flow Architecture

## 🏗️ Application Structure

```
nibble-frontend/
├── src/
│   ├── main.ts                    # App entry point
│   ├── App.vue                    # Root component
│   ├── router/index.ts            # Vue Router configuration
│   ├── services/api.ts            # API client layer
│   ├── types/api.ts               # TypeScript definitions
│   ├── stores/                    # Pinia state stores
│   │   ├── auth.ts
│   │   ├── recipe.ts
│   │   ├── version.ts
│   │   ├── notebook.ts
│   │   └── annotation.ts
│   ├── views/                     # Page components
│   │   ├── HomeView.vue
│   │   ├── AuthView.vue
│   │   ├── RecipesView.vue
│   │   ├── RecipeDetailView.vue
│   │   ├── RecipeVersionsView.vue
│   │   ├── CookbookView.vue
│   │   └── AboutView.vue
│   └── components/                # Reusable components
│       ├── MainLayout.vue
│       ├── RecipeCard.vue
│       ├── RecipeView.vue
│       ├── VersionView.vue
│       ├── AnnotationSystem.vue
│       ├── CookbookView.vue
│       └── CookbookSidebar.vue
```

---

## 🔄 Data Flow Architecture

### High-Level Flow

```
┌──────────────┐
│  Vue Router  │
└──────┬───────┘
       │ Routes to
       ↓
┌──────────────┐
│  Page Views  │ ← RecipesView, RecipeDetailView, etc.
└──────┬───────┘
       │ Uses
       ↓
┌──────────────┐
│ Pinia Stores │ ← auth, recipe, version, notebook, annotation
└──────┬───────┘
       │ Calls
       ↓
┌──────────────┐
│ API Services │ ← userApi, recipeApi, versionApi, etc.
└──────┬───────┘
       │ HTTP POST
       ↓
┌──────────────┐
│    Backend   │ ← Deno + Hono API
└──────────────┘
```

### Detailed Flow Example: Loading Recipes

```
1. User navigates to /recipes
   ↓
2. Router mounts RecipesView.vue
   ↓
3. RecipesView calls: recipeStore.loadUserRecipes()
   ↓
4. Store calls: recipeApi.listRecipesByOwner(userId)
   ↓
5. API makes: POST /api/Recipe/_listRecipesByOwner
   ↓
6. Backend returns: [{ recipe: { _id, title, ... } }, ...]
   ↓
7. Store updates: recipes.value = responseArray
   ↓
8. Vue reactivity triggers: RecipesView re-renders
   ↓
9. RecipeCard components display recipes
```

---

## 🗺️ Route Structure

```typescript
// router/index.ts

const routes = [
  {
    path: "/",
    component: HomeView,
    meta: { requiresAuth: false },
  },
  {
    path: "/auth",
    component: AuthView,
    meta: { requiresAuth: false },
  },
  {
    path: "/recipes",
    component: RecipesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/recipes/:id",
    component: RecipeDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: "/recipes/:id/versions",
    component: RecipeVersionsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/cookbooks",
    component: CookbookView,
    meta: { requiresAuth: true },
  },
  {
    path: "/about",
    component: AboutView,
    meta: { requiresAuth: false },
  },
];
```

### Route Guards (Expected)

```typescript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/auth"); // Redirect to login
  } else {
    next();
  }
});
```

---

## 📱 View Components

### HomeView.vue

- **Purpose:** Landing page
- **Data:** None
- **Actions:** Navigation to auth or recipes

### AuthView.vue

- **Purpose:** Login/Registration page
- **Store:** `useAuthStore()`
- **Actions:**
  - `authStore.login(email, password)`
  - `authStore.register(name, email, password)`
- **Navigation:** On success → `/recipes`

### RecipesView.vue

- **Purpose:** List all user's recipes
- **Store:** `useRecipeStore()`, `useAuthStore()`
- **Lifecycle:**
  ```typescript
  onMounted(async () => {
    await recipeStore.loadUserRecipes();
  });
  ```
- **Data Displayed:**
  - `recipeStore.recipes`
  - `recipeStore.isLoading`
  - `recipeStore.error`
- **Components Used:** `RecipeCard.vue` (for each recipe)
- **Actions:**
  - Create new recipe
  - Navigate to recipe detail
  - Search/filter recipes

### RecipeDetailView.vue

- **Purpose:** View/edit single recipe
- **Store:** `useRecipeStore()`, `useAnnotationStore()`
- **Route Params:** `id` (recipe ID)
- **Lifecycle:**
  ```typescript
  onMounted(async () => {
    await recipeStore.loadRecipeById(route.params.id);
    await annotationStore.loadAnnotationsForRecipe(route.params.id);
  });
  ```
- **Data Displayed:**
  - `recipeStore.currentRecipe`
  - `annotationStore.annotations`
- **Components Used:**
  - `RecipeView.vue` (display recipe)
  - `AnnotationSystem.vue` (annotations)
- **Actions:**
  - Edit recipe details
  - Add/remove tags
  - Delete recipe
  - View versions
  - Add annotations

### RecipeVersionsView.vue

- **Purpose:** List all versions of a recipe
- **Store:** `useVersionStore()`, `useRecipeStore()`
- **Route Params:** `id` (recipe ID)
- **Lifecycle:**
  ```typescript
  onMounted(async () => {
    await recipeStore.loadRecipeById(route.params.id);
    await versionStore.loadVersionsByRecipe(route.params.id);
  });
  ```
- **Data Displayed:**
  - `versionStore.versions`
  - Base recipe info
- **Components Used:** `VersionView.vue`
- **Actions:**
  - Create manual version
  - Draft version with AI
  - Approve/reject AI drafts
  - View version details
  - Delete version

### CookbookView.vue

- **Purpose:** Manage collaborative notebooks
- **Store:** `useNotebookStore()`, `useAuthStore()`
- **Lifecycle:**
  ```typescript
  onMounted(async () => {
    await notebookStore.loadUserNotebooks();
  });
  ```
- **Data Displayed:**
  - `notebookStore.userNotebooks` (owned)
  - `notebookStore.sharedNotebooks` (member of)
- **Components Used:** `CookbookSidebar.vue`
- **Actions:**
  - Create notebook
  - View notebook contents
  - Invite members
  - Share recipes
  - Delete notebook

---

## 🧩 Reusable Components

### MainLayout.vue

- **Purpose:** App shell (header, nav, footer)
- **Store:** `useAuthStore()`
- **Features:**
  - Navigation menu
  - User info display
  - Logout button
- **Slots:** `<slot />` for page content

### RecipeCard.vue

- **Props:**
  ```typescript
  defineProps<{
    recipe: Recipe;
  }>();
  ```
- **Displays:**
  - Recipe title
  - Description preview
  - Tags
  - Created/updated dates
- **Emits:** `@click` → navigate to detail view

### RecipeView.vue

- **Props:**
  ```typescript
  defineProps<{
    recipe: Recipe;
    editable?: boolean;
  }>();
  ```
- **Displays:**
  - Full recipe details
  - Ingredients list
  - Steps list
  - Tags
- **Emits:** `@update` when edited

### VersionView.vue

- **Props:**
  ```typescript
  defineProps<{
    version: Version;
  }>();
  ```
- **Displays:**
  - Version number
  - Author info
  - Notes
  - Modified ingredients/steps
  - Prompt history (if AI-generated)
- **Actions:** Delete, compare with base recipe

### AnnotationSystem.vue

- **Props:**
  ```typescript
  defineProps<{
    recipeId: string;
    ingredients: Ingredient[];
    steps: Step[];
  }>();
  ```
- **Store:** `useAnnotationStore()`
- **Features:**
  - Display annotations on ingredients/steps
  - Add new annotation
  - Edit annotation (if author)
  - Resolve/unresolve annotation
  - Delete annotation (if author)
- **UI:** Likely uses overlays or inline comments

### CookbookSidebar.vue

- **Props:**
  ```typescript
  defineProps<{
    notebooks: Notebook[];
  }>();
  ```
- **Displays:**
  - List of notebooks
  - Owned vs. shared indication
- **Emits:** `@select` when notebook clicked

### CookbookView.vue (component)

- **Props:**
  ```typescript
  defineProps<{
    notebook: Notebook;
  }>();
  ```
- **Displays:**
  - Notebook details
  - Members list
  - Shared recipes
- **Actions:**
  - Add/remove members
  - Share/unshare recipes

---

## 🔐 Authentication Flow

### Initial App Load

```
main.ts
  ↓
App.vue (created)
  ↓
authStore.initializeAuth()
  ↓
Check localStorage for 'currentUser'
  ↓
If found → Parse and set currentUser
If not found → User not logged in
  ↓
Router decides: requiresAuth? → redirect to /auth
```

### Login Process

```
User fills form in AuthView
  ↓
authStore.login(email, password)
  ↓
userApi.login({ email, password })
  ↓
Backend: POST /api/User/login → { user: "ID" }
  ↓
userApi.getUserDetails(userId)
  ↓
Backend: POST /api/User/_getUserDetails → [{ user: {...} }]
  ↓
authStore.currentUser = userData
localStorage.setItem('currentUser', JSON.stringify(userData))
  ↓
Router: push('/recipes')
  ↓
RecipesView mounted → loads user's recipes
```

### Logout Process

```
User clicks logout button
  ↓
authStore.logout()
  ↓
currentUser.value = null
localStorage.removeItem('currentUser')
  ↓
Router: push('/') or push('/auth')
```

---

## 📊 State Management Patterns

### Store Composition

```typescript
// Each store follows this pattern:

export const useRecipeStore = defineStore("recipe", () => {
  // 1. STATE
  const recipes = ref<Recipe[]>([]);
  const currentRecipe = ref<Recipe | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 2. COMPUTED (derived state)
  const userRecipes = computed(() => {
    if (!authStore.userId) return [];
    return recipes.value.filter((r) => r.owner === authStore.userId);
  });

  // 3. ACTIONS (async operations)
  async function loadRecipes() {
    isLoading.value = true;
    try {
      const response = await recipeApi.listRecipesByOwner(authStore.userId);
      recipes.value = response;
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  // 4. RETURN (expose public API)
  return {
    recipes,
    currentRecipe,
    isLoading,
    error,
    userRecipes,
    loadRecipes,
    // ... more actions
  };
});
```

### Store Dependencies

```typescript
// auth.ts - Root store (no dependencies)
export const useAuthStore = defineStore("auth", () => {
  // ... manages user authentication
});

// recipe.ts - Depends on auth
export const useRecipeStore = defineStore("recipe", () => {
  const authStore = useAuthStore(); // Access userId

  async function createRecipe(data) {
    if (!authStore.userId) throw new Error("Not authenticated");
    // ...
  }
});

// All other stores follow same pattern:
// version.ts, annotation.ts, notebook.ts depend on auth
```

---

## 🎨 Component Communication Patterns

### Pattern 1: Props Down, Events Up

```vue
<!-- Parent: RecipesView.vue -->
<RecipeCard
  v-for="recipe in recipes"
  :key="recipe._id"
  :recipe="recipe"
  @click="viewRecipe(recipe._id)"
/>

<!-- Child: RecipeCard.vue -->
<script setup>
const props = defineProps<{ recipe: Recipe }>();
const emit = defineEmits<{ click: [] }>();
</script>
```

### Pattern 2: Shared Store

```vue
<!-- Both components access same store -->
<script setup>
// RecipesView.vue
const recipeStore = useRecipeStore();
await recipeStore.loadUserRecipes();
</script>

<script setup>
// RecipeCard.vue
const recipeStore = useRecipeStore();
// Accesses same reactive state
</script>
```

### Pattern 3: Provide/Inject (if used)

```vue
<!-- Parent provides context -->
<script setup>
provide("recipeId", recipeId);
</script>

<!-- Descendant injects -->
<script setup>
const recipeId = inject < string > "recipeId";
</script>
```

---

## 🔄 Reactive Updates

### Automatic Re-rendering

Vue's reactivity system automatically re-renders components when:

```typescript
// Store updates reactive refs
recipes.value = newRecipes; // ← Triggers re-render

// Component template uses reactive data
<div v-for="recipe in recipes"> // ← Auto-updates when recipes changes
```

### Manual Refresh Patterns

```typescript
// After creating/updating/deleting
await recipeStore.createRecipe(data);
await recipeStore.loadUserRecipes(); // ← Explicit refresh

// Or refresh single item
await recipeStore.updateRecipe(id, updates);
await recipeStore.loadRecipeById(id); // ← Refresh current recipe
```

### Loading States

```vue
<template>
  <div v-if="recipeStore.isLoading">Loading...</div>
  <div v-else-if="recipeStore.error">Error: {{ recipeStore.error }}</div>
  <div v-else>
    <!-- Display recipes -->
  </div>
</template>
```

---

## 🌊 Data Flow Examples

### Example 1: Creating a Recipe

```
┌─────────────────────────────────────────────────────────────┐
│ User Action: Clicks "Create Recipe" button in RecipesView  │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ RecipesView: Opens form modal, user fills out form         │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ RecipesView: Calls recipeStore.createRecipe(formData)      │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Store: Sets isLoading = true                                │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Store: Calls recipeApi.createRecipe({...formData, owner})  │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ API: POST /api/Recipe/createRecipe                          │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Backend: Creates recipe in MongoDB, returns { recipe: ID } │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Store: Calls loadUserRecipes() to refresh list             │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ API: POST /api/Recipe/_listRecipesByOwner                   │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Backend: Returns array of recipes                           │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Store: Updates recipes.value = responseArray               │
│        Sets isLoading = false                               │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Vue: Detects reactive change, re-renders RecipesView       │
│      New recipe appears in list                             │
└─────────────────────────────────────────────────────────────┘
```

### Example 2: Viewing Recipe with Annotations

```
User clicks recipe card → RecipeDetailView
  ↓
Route changes: /recipes/:id
  ↓
RecipeDetailView.onMounted()
  ↓
Parallel Calls:
  ├→ recipeStore.loadRecipeById(id)
  │   ↓
  │   POST /api/Recipe/_getRecipeById
  │   ↓
  │   recipeStore.currentRecipe = recipe
  │
  └→ annotationStore.loadAnnotationsForRecipe(id)
      ↓
      POST /api/Annotation/_getAnnotationsForRecipe
      ↓
      annotationStore.annotations = annotationArray
  ↓
Vue: Re-renders with recipe + annotations
  ↓
Components:
  ├→ RecipeView displays recipe
  └→ AnnotationSystem displays annotations on ingredients/steps
```

### Example 3: Adding a Tag

```
User types tag in input, presses Enter
  ↓
RecipeDetailView: recipeStore.addTag(recipeId, tagText)
  ↓
Store: POST /api/Recipe/addTag
  ↓
Backend: Adds tag to recipe.tags array
  ↓
Store: Updates local state optimistically (or waits for response)
  recipe.tags.push(tagText)
  ↓
Vue: Re-renders tag list immediately
```

---

## 🎯 Key Observations

### Strengths

1. **Clear Separation of Concerns**

   - Views handle UI/UX
   - Stores handle state + business logic
   - Services handle API communication

2. **Consistent Patterns**

   - All stores follow same structure
   - Predictable loading/error states
   - Defensive response parsing

3. **Reactive Architecture**

   - Vue automatically re-renders on state changes
   - Minimal manual DOM manipulation

4. **Type Safety**
   - Full TypeScript coverage
   - Shared types between layers

### Areas for Improvement

1. **Loading States**

   - Could use global loading indicator
   - Better skeleton screens

2. **Error Handling**

   - No toast notifications
   - Errors only in console/store

3. **Caching**

   - No cache invalidation strategy
   - Re-fetches data on every mount

4. **Optimistic Updates**
   - Most operations wait for server
   - Could update UI immediately, rollback on error

---

## 📈 Performance Considerations

### Current Approach

- Fetch data on component mount
- No pagination (all results at once)
- No infinite scroll
- No virtual scrolling for long lists

### Potential Optimizations

1. Add pagination to list views
2. Implement virtual scrolling for large lists
3. Cache API responses with expiry
4. Debounce search inputs
5. Lazy load non-critical components
6. Preload likely next routes

---

## 🔧 Development Workflow

### Running the App

```bash
# Terminal 1: Backend
cd nibble-backend
deno task concepts

# Terminal 2: Frontend
cd nibble-frontend
npm run dev
```

### Making Changes

```
1. Update types in frontend/src/types/api.ts
2. Update service methods in frontend/src/services/api.ts
3. Update store actions in frontend/src/stores/*.ts
4. Update component logic in frontend/src/views/*.vue
5. Test in browser at http://localhost:5173
```

---

## 📚 Further Reading

- **Vue 3 Composition API:** https://vuejs.org/guide/extras/composition-api-faq.html
- **Pinia State Management:** https://pinia.vuejs.org/
- **Vue Router:** https://router.vuejs.org/
- **TypeScript with Vue:** https://vuejs.org/guide/typescript/overview.html

---

**Last Updated:** October 21, 2025
