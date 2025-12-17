# Quick Start Guide - Floor API Integration

## 🚀 Get Started in 5 Minutes

### Step 1: Verify Backend (2 min)

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Expected output: Server is running at http://localhost:5001
```

### Step 2: Configure Frontend (1 min)

```bash
# In frontend directory
# If not already created, create .env.local
echo "VITE_API_URL=http://localhost:5001/api/v1" > .env.local
```

### Step 3: Start Frontend (1 min)

```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
# Expected output: Local: http://localhost:5173
```

### Step 4: Test Integration (1 min)

1. Open http://localhost:5173 in browser
2. Navigate to Manager Dashboard → Location Management
3. Click "Quản lý tầng" (Manage Floors) tab
4. You should see floors loading from API
5. Try creating, editing, or deleting a floor

✅ **That's it! You're done!**

---

## 📋 What Was Integrated

### ✅ Created Files
- `src/lib/apiClient.ts` - Generic HTTP client
- `src/lib/floorApi.ts` - Floor API service
- `src/hooks/useFloors.ts` - Floor state hook
- `.env.local` - Configuration file
- `.env.example` - Configuration template

### ✅ Updated Files
- `src/components/staff/manager/LocationManagement.tsx` - Now uses API
- `src/types/index.ts` - Updated Floor interface

### ✅ Documentation
- `FRONTEND_API_INTEGRATION.md` - Full integration guide
- `INTEGRATION_CHECKLIST.md` - Verification checklist
- `FLOOR_API_INTEGRATION_SUMMARY.md` - Summary of changes
- `ARCHITECTURE_DIAGRAMS.md` - Visual diagrams

---

## 🎯 How It Works

### Simple Example

```typescript
// In LocationManagement.tsx
import { useFloors } from '../hooks/useFloors';

function LocationManagement() {
  // This hook automatically fetches floors from API on mount
  const { floors, loading, error, createFloor, updateFloor, deleteFloor } = useFloors();

  // Display floors
  return (
    <div>
      {loading && <Loader />}
      {error && <ErrorMessage error={error} />}
      {floors.map(floor => (
        <FloorCard
          key={floor.id}
          floor={floor}
          onEdit={() => updateFloor(...)}
          onDelete={() => deleteFloor(...)}
        />
      ))}
    </div>
  );
}
```

---

## 🔧 API Endpoints

All endpoints are available at: `http://localhost:5001/api/v1/floors`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/floors` | Get all floors |
| POST | `/floors` | Create new floor |
| GET | `/floors/:id` | Get floor by ID |
| PUT | `/floors/:id` | Update floor |
| DELETE | `/floors/:id` | Delete floor |

---

## 📊 Data Format

### Request Example (Create Floor)

```json
POST /floors
{
  "floor_name": "Tầng 1",
  "floor_number": 1,
  "description": "Ground floor"
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "floor_name": "Tầng 1",
    "floor_number": 1,
    "description": "Ground floor",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Floor created successfully"
}
```

---

## ✨ Features

### ✅ Auto-Loading
Floors load automatically when component mounts

### ✅ Real-Time Updates
Changes appear immediately in the UI

### ✅ Error Handling
User-friendly error messages with retry button

### ✅ Loading States
Spinner shows while data is loading

### ✅ Validation
Form validation before API calls

### ✅ Toast Notifications
Success/error feedback to user

### ✅ Type Safety
Full TypeScript support with autocomplete

---

## 🐛 Troubleshooting

### Q: Floors not loading?
**A:** Check that:
1. Backend is running on port 5001
2. `.env.local` has correct API URL
3. Browser console has no errors
4. Network tab shows `/floors` request

### Q: Getting 404 errors?
**A:** Check that:
1. Backend routes are registered
2. Endpoint URL is correct
3. Backend server didn't crash

### Q: Getting CORS errors?
**A:** Check that:
1. Backend has CORS enabled
2. Frontend API URL is correct
3. Network requests go to right server

### Q: Getting TypeScript errors?
**A:** Check that:
1. Floor type matches API response
2. Import statements are correct
3. Run `npm run build` to see full errors

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `FRONTEND_API_INTEGRATION.md` | Complete integration guide with code examples |
| `INTEGRATION_CHECKLIST.md` | Step-by-step verification checklist |
| `FLOOR_API_INTEGRATION_SUMMARY.md` | Summary of what was done |
| `ARCHITECTURE_DIAGRAMS.md` | Visual system architecture |

---

## 🎓 Learn More

### API Client Pattern
```typescript
// apiClient handles all HTTP requests
const response = await apiClient.get('/floors');  // GET
const response = await apiClient.post('/floors', data);  // POST
```

### Service Pattern
```typescript
// floorApi wraps apiClient with domain-specific methods
const floors = await floorApi.getAll();
const floor = await floorApi.getById(id);
```

### Hook Pattern
```typescript
// useFloors provides React component interface
const { floors, loading, error, createFloor } = useFloors();
```

---

## 💡 Best Practices

✅ Always use custom hooks in components
✅ Always validate data before sending
✅ Always handle loading states
✅ Always handle error states
✅ Always show feedback to user (toast)
✅ Always use TypeScript types
✅ Always test CRUD operations

---

## 🚀 Next Steps

1. ✅ Floor API integrated
2. Create similar integrations for:
   - Location management
   - Table management
   - Order management
   - Customer management
3. Test all CRUD operations
4. Deploy to production

---

## 📞 Support

If you encounter issues:

1. **Check browser console** - Look for error messages
2. **Check network tab** - See HTTP requests/responses
3. **Check backend logs** - Look for server-side errors
4. **Read documentation** - Refer to integration guides
5. **Review code examples** - Check existing implementations

---

## ✅ Verification Checklist

- [ ] Backend running on port 5001
- [ ] Frontend running on port 5173
- [ ] `.env.local` configured with API URL
- [ ] Floor list loads without errors
- [ ] Can create floor
- [ ] Can edit floor
- [ ] Can delete floor
- [ ] No console errors
- [ ] No CORS errors
- [ ] Network requests show 200/201 status

---

**Status**: ✅ Complete and Ready!

**Next Action**: Start both servers and test the Floor Management page

Good luck! 🎉
