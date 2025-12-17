# Frontend API Integration Checklist

## ✅ Files Created/Updated

### API Infrastructure
- [x] `frontend/src/lib/apiClient.ts` - Generic HTTP client
- [x] `frontend/src/lib/floorApi.ts` - Floor API service
- [x] `frontend/src/hooks/useFloors.ts` - Floor custom hook
- [x] `frontend/.env.local` - Environment configuration
- [x] `frontend/.env.example` - Environment template

### Component Integration
- [x] `frontend/src/components/staff/manager/LocationManagement.tsx` - Updated with API integration
- [x] `frontend/src/types/index.ts` - Updated Floor interface to match API

### Documentation
- [x] `FRONTEND_API_INTEGRATION.md` - Comprehensive integration guide
- [x] This checklist file

## 🔍 Verification Steps

### 1. Backend Server Running
```bash
cd backend
npm run dev
# Should see: Server is running at http://localhost:5001
```

### 2. Frontend Environment Setup
- [x] Create `.env.local` with `VITE_API_URL=http://localhost:5001/api/v1`
- [x] Or copy from `.env.example`

### 3. Frontend Server Running
```bash
cd frontend
npm run dev
# Should see: Local: http://localhost:5173
```

### 4. Test Floor API Integration

#### 4.1 Navigate to Manager Dashboard
- Open http://localhost:5173 in browser
- Navigate to Manager section
- Open Location Management

#### 4.2 Check Floors Tab
- Click "Quản lý tầng" (Manage Floors) tab
- You should see existing floors from API loading
- Check browser console for any errors

#### 4.3 Test Create Floor
- Click "Thêm tầng" (Add Floor)
- Fill in floor name, number, description
- Click "Thêm tầng" to create
- Should see toast notification: "Đã thêm tầng mới thành công"
- New floor should appear in list

#### 4.4 Test Edit Floor
- Click "Sửa" (Edit) on any floor
- Modify the floor details
- Click "Cập nhật" to save
- Should see toast: "Đã cập nhật tầng thành công"
- Floor details should update in list

#### 4.5 Test Delete Floor
- Click trash icon on any floor (without locations)
- Confirm deletion in modal
- Should see toast: "Đã xóa tầng thành công"
- Floor should be removed from list

### 5. Browser Console Check
- Open Developer Tools (F12)
- Go to Console tab
- Should see no errors related to:
  - `404 Not Found`
  - `CORS errors`
  - `TypeError: Cannot read property...`

### 6. Network Tab Check
- Open Developer Tools (F12)
- Go to Network tab
- When interacting with floors, should see:
  - `GET /floors` - Initial load
  - `POST /floors` - Create
  - `PUT /floors/:id` - Update
  - `DELETE /floors/:id` - Delete
- All requests should return `200` or `201` status
- Response should have `success: true`

### 7. Backend Console Check
- Check backend terminal
- Should see request logs like:
  ```
  GET /floors - 200 OK
  POST /floors - 201 Created
  PUT /floors/:id - 200 OK
  DELETE /floors/:id - 200 OK
  ```

## 🚀 Architecture Summary

```
User Interaction (LocationManagement.tsx)
        ↓
React Hook (useFloors)
        ↓
API Service (floorApi.ts)
        ↓
HTTP Client (apiClient.ts)
        ↓
Fetch API (http://localhost:5001/api/v1/floors)
        ↓
Backend Express Routes
        ↓
Controllers → Services → Repositories
        ↓
MongoDB Database
```

## 🔧 Data Flow Example

### Create Floor
```
User clicks "Thêm tầng"
  ↓
Modal opens, user enters floor data
  ↓
User clicks "Thêm tầng" button
  ↓
handleSubmitFloor() validates data
  ↓
createFloor() from useFloors hook is called
  ↓
floorApi.create(data) is called
  ↓
apiClient.post<Floor>('/floors', data)
  ↓
Fetch POST to http://localhost:5001/api/v1/floors
  ↓
Backend receives, validates, saves to MongoDB
  ↓
Returns response: { success: true, data: { id, floor_name, floor_number, ... } }
  ↓
Hook updates state with new floor
  ↓
Component re-renders with new floor in list
  ↓
Toast shows: "Đã thêm tầng mới thành công"
```

## 📋 Component Structure

### LocationManagement.tsx
```typescript
// Uses the custom hook
const { floors, loading, error, createFloor, updateFloor, deleteFloor } = useFloors();

// Shows loading state
{floorsLoading ? <Loader /> : <FloorsList />}

// Shows error state
{floorsError && <ErrorAlert />}

// Renders floors from API
{floors.map(floor => <FloorCard key={floor.id} floor={floor} />)}

// Handles CRUD operations
handleSubmitFloor() → createFloor() → API call
handleEditFloor() → updateFloor() → API call
handleDeleteFloor() → deleteFloor() → API call
```

## 🎯 Integration Status

| Component | Status | Notes |
|-----------|--------|-------|
| API Client | ✅ Complete | Generic HTTP client created |
| Floor API | ✅ Complete | All CRUD endpoints implemented |
| useFloors Hook | ✅ Complete | Auto-fetches on mount, updates state |
| LocationManagement | ✅ Complete | Uses hook, handles loading/error/success |
| Environment Config | ✅ Complete | .env.local with API URL |
| Type Definitions | ✅ Complete | Floor interface matches API response |

## 📚 Documentation

- [x] FRONTEND_API_INTEGRATION.md - Full integration guide
- [x] .env.example - Environment template
- [x] This checklist

## 🐛 Troubleshooting

### Floors not loading
1. Check backend is running: `npm run dev` in `/backend`
2. Check API URL in `.env.local` is correct
3. Check browser console for errors
4. Check network tab for failed requests

### 404 errors on floor routes
1. Verify `/floors` endpoint exists in backend
2. Check backend routes are registered
3. Try directly in browser: `http://localhost:5001/api/v1/floors`

### CORS errors
1. Backend should have CORS enabled
2. Verify frontend URL matches CORS whitelist
3. Check requests go to correct API URL

### Type errors
1. Ensure Floor type matches backend response
2. Check floorApi.ts types are correct
3. Run `npm run build` to check for TypeScript errors

## ✨ Next Steps (Optional)

1. Create similar integrations for Location, Table modules
2. Add order API integration to OrderManagement
3. Add customer API integration to CustomerManagement
4. Add staff API integration to StaffManagement
5. Add caching/optimization if needed
6. Add comprehensive error logging
7. Add request retry logic
8. Add offline mode support

---

**Last Updated**: Current Session
**Integration Status**: ✅ Complete
**Ready for Testing**: Yes
