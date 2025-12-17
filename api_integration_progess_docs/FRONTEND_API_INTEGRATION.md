# Frontend API Integration Guide

## Overview

The frontend is now integrated with the backend REST API using a modular architecture consisting of:

1. **API Client** (`apiClient.ts`) - Generic HTTP client
2. **API Services** (e.g., `floorApi.ts`) - Domain-specific API endpoints
3. **Custom Hooks** (e.g., `useFloors.ts`) - React hooks for state management
4. **Components** - React components consuming the hooks

## Architecture

```
Component (LocationManagement.tsx)
    ↓ (uses)
Custom Hook (useFloors.ts)
    ↓ (calls)
API Service (floorApi.ts)
    ↓ (uses)
API Client (apiClient.ts)
    ↓ (makes HTTP requests)
Backend Express API (http://localhost:5001/api/v1)
    ↓ (handled by)
Controllers → Services → Repositories → Database
```

## Files Created

### 1. API Client (`src/lib/apiClient.ts`)

Generic HTTP client supporting all CRUD operations:

```typescript
import { apiClient } from '../lib/apiClient';

// Generic GET request
const response = await apiClient.get<DataType>('/endpoint');

// Generic POST request
const response = await apiClient.post<DataType>('/endpoint', { data });

// PUT, DELETE, PATCH supported as well
```

**Features:**
- Typed requests/responses using TypeScript generics
- Automatic JSON headers
- Error handling and retries
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)

### 2. API Services

Domain-specific API services wrapping the generic client:

#### Floor API (`src/lib/floorApi.ts`)

```typescript
import { floorApi } from '../lib/floorApi';

// Get all floors
const response = await floorApi.getAll();

// Get floor by ID
const response = await floorApi.getById(floorId);

// Create floor
const response = await floorApi.create({
  floor_name: 'Floor 1',
  floor_number: 1,
  description: 'Main floor'
});

// Update floor
const response = await floorApi.update(floorId, {
  floor_name: 'Floor 1 Updated'
});

// Delete floor
await floorApi.delete(floorId);
```

### 3. Custom Hooks

React hooks for managing state and API interactions:

#### useFloors Hook (`src/hooks/useFloors.ts`)

```typescript
import { useFloors } from '../hooks/useFloors';

function MyComponent() {
  const {
    floors,        // Floor[] - all floors from API
    loading,       // boolean - loading state
    error,         // string | null - error message
    fetchFloors,   // () => Promise - refresh floors
    createFloor,   // (data) => Promise - create floor
    updateFloor,   // (id, data) => Promise - update floor
    deleteFloor,   // (id) => Promise - delete floor
  } = useFloors();

  // useFloors automatically fetches floors on mount
  // and updates the state on success
}
```

**Features:**
- Auto-fetches data on component mount
- Automatic state updates on CRUD operations
- Error handling and loading states
- Type-safe with TypeScript generics

### 4. Integration Example

#### LocationManagement Component (`src/components/staff/manager/LocationManagement.tsx`)

The component is fully integrated with the Floor API:

```typescript
// Import the hook
import { useFloors } from '../../../hooks/useFloors';

// Use the hook in component
const {
  floors,
  loading: floorsLoading,
  error: floorsError,
  createFloor,
  updateFloor,
  deleteFloor,
  fetchFloors,
} = useFloors();

// Create floor
const handleSubmitFloor = async () => {
  try {
    await createFloor({
      floor_name: floorFormData.name,
      floor_number: floorFormData.floor_number,
      description: floorFormData.description,
    });
    toast.success('Đã thêm tầng mới thành công');
  } catch (error) {
    toast.error('Lỗi khi lưu tầng');
  }
};
```

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Frontend API Configuration
VITE_API_URL=http://localhost:5001/api/v1
```

For development: `http://localhost:5001/api/v1`
For production: Update to your production API URL

## Step-by-Step: Creating New API Integrations

### Step 1: Create API Service

Create `src/lib/[entityName]Api.ts`:

```typescript
import { apiClient } from './apiClient';

export interface YourEntityData {
  // Define your entity fields
  name: string;
  // ... other fields
}

class YourEntityApi {
  async getAll() {
    return apiClient.get<YourEntityData[]>('/your-entity');
  }

  async getById(id: string) {
    return apiClient.get<YourEntityData>(`/your-entity/${id}`);
  }

  async create(data: YourEntityData) {
    return apiClient.post<YourEntityData>('/your-entity', data);
  }

  async update(id: string, data: Partial<YourEntityData>) {
    return apiClient.put<YourEntityData>(`/your-entity/${id}`, data);
  }

  async delete(id: string) {
    return apiClient.delete(`/your-entity/${id}`);
  }
}

export const yourEntityApi = new YourEntityApi();
```

### Step 2: Create Custom Hook

Create `src/hooks/use[EntityName].ts`:

```typescript
import { useState, useCallback, useEffect } from 'react';
import { yourEntityApi, YourEntityData } from '../lib/yourEntityApi';

export function useYourEntity() {
  const [state, setState] = useState({
    entities: [],
    loading: false,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await yourEntityApi.getAll();
      setState({
        entities: response.data,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Error',
      }));
    }
  }, []);

  const create = useCallback(async (data: YourEntityData) => {
    const response = await yourEntityApi.create(data);
    setState(prev => ({
      ...prev,
      entities: [...prev.entities, response.data],
    }));
    return response.data;
  }, []);

  // Add update, delete methods similarly

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    ...state,
    fetch,
    create,
    // ... other methods
  };
}
```

### Step 3: Use in Component

```typescript
import { useYourEntity } from '../hooks/useYourEntity';

function MyComponent() {
  const { entities, loading, error, create, update, delete: deleteEntity } = useYourEntity();

  // Use the hook data and methods
}
```

## API Response Format

All backend endpoints return data in this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

The `apiClient` automatically unwraps the `data` field, so you get `T` directly.

## Error Handling

### In Components

```typescript
try {
  await createFloor(data);
  toast.success('Success');
} catch (error) {
  const message = error instanceof Error 
    ? error.message 
    : 'An error occurred';
  toast.error(message);
}
```

### In API Services

Errors are thrown automatically by the apiClient if the response status is not 2xx.

## Best Practices

1. **Always use custom hooks** - Don't call API services directly in components
2. **Type everything** - Use TypeScript interfaces for all data
3. **Handle loading states** - Show spinners while data is loading
4. **Handle errors gracefully** - Display error messages to users
5. **Use toast notifications** - For user feedback (success/error/warning)
6. **Validate data before sending** - Use the `validation.ts` utilities
7. **Keep components focused** - Let hooks handle API logic
8. **Test API calls** - Mock the hooks in component tests

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Verify backend is running on `http://localhost:5001`
2. Check `VITE_API_URL` in `.env.local`
3. Verify backend has CORS enabled

### 404 Not Found

If you get 404 errors:
1. Check the endpoint URL in the API service
2. Verify the backend route is registered
3. Check the console for the actual URL being called

### Type Errors

If you get TypeScript errors:
1. Update the API response interface to match the backend response
2. Ensure Floor type in `types/index.ts` matches backend Floor entity
3. Check the `floorApi.ts` method signatures

## Next Steps

1. ✅ Floor API integrated with LocationManagement component
2. Create similar integrations for other entities:
   - Location API and hook
   - Table API and hook
   - Order API and hook
   - etc.
3. Add API integrations for other components
4. Add API error logging/monitoring
5. Add request caching if needed
6. Add request retry logic if needed

## Running the Full Stack

### Terminal 1 - Backend

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5001
```

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

The frontend will automatically call the backend API at `http://localhost:5001/api/v1`.

## Testing the Integration

1. Start both backend and frontend servers
2. Navigate to the manager dashboard
3. Go to "Quản lý tầng" (Floor Management) tab
4. You should see floors from the API
5. Try creating, editing, and deleting floors
6. Check the browser console for any errors
7. Check the backend terminal for request logs

Good luck with your restaurant management system! 🎉
