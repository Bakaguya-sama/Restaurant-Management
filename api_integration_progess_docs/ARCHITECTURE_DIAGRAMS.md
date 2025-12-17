# Frontend-Backend Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REACT FRONTEND                              │
│                    (http://localhost:5173)                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │           LocationManagement Component                      │  │
│  │  - Renders floor list                                       │  │
│  │  - Shows loading/error states                               │  │
│  │  - Handles user interactions                                │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│                                │ uses                              │
│                                ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │           useFloors Custom Hook                             │  │
│  │  - Manages floors state                                     │  │
│  │  - Handles CRUD operations                                  │  │
│  │  - Auto-fetches on mount                                    │  │
│  │  - Updates state after API calls                            │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│                                │ calls                             │
│                                ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │           floorApi Service                                  │  │
│  │  - getAll()                                                 │  │
│  │  - getById(id)                                              │  │
│  │  - create(data)                                             │  │
│  │  - update(id, data)                                         │  │
│  │  - delete(id)                                               │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│                                │ uses                              │
│                                ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │           apiClient                                         │  │
│  │  - Generic HTTP client                                      │  │
│  │  - Handles GET, POST, PUT, DELETE, PATCH                   │  │
│  │  - Automatic JSON encoding/decoding                         │  │
│  │  - Error handling                                           │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│                                │ makes HTTP requests               │
│                                ▼                                   │
│                HTTP Fetch API (Browser)                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ NETWORK REQUESTS
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS BACKEND                             │
│                  (http://localhost:5001/api/v1)                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Routes (floors.routes.js)                                  │  │
│  │  - GET    /floors                                           │  │
│  │  - POST   /floors                                           │  │
│  │  - GET    /floors/:id                                       │  │
│  │  - PUT    /floors/:id                                       │  │
│  │  - DELETE /floors/:id                                       │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│                                │ routes to                         │
│                                ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Controller (floor.controller.js)                           │  │
│  │  - Validates request                                        │  │
│  │  - Handles HTTP response                                    │  │
│  │  - Returns formatted JSON                                   │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│                                │ delegates to                      │
│                                ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Service Layer (floor.service.js)                           │  │
│  │  - Business logic                                           │  │
│  │  - Data validation                                          │  │
│  │  - Error handling                                           │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│                                │ uses                              │
│                                ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Repository Layer (floor.repository.js)                     │  │
│  │  - Database queries                                         │  │
│  │  - CRUD operations                                          │  │
│  │  - Data access layer                                        │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                   │
│                                │ queries                           │
│                                ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  MongoDB Database                                           │  │
│  │  - restaurant_management (dev)                              │  │
│  │  - restaurant_management_test (tests)                       │  │
│  │  - Collections: floors, locations, tables, etc.             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow Example: Create Floor

```
User Clicks "Thêm tầng"
           │
           ▼
Modal Opens
           │
User Fills Form
{
  floor_name: "Tầng 2",
  floor_number: 2,
  description: "Second Floor"
}
           │
User Clicks "Thêm tầng"
           │
           ▼
handleSubmitFloor() {
  - Validates data
  - Calls createFloor(data)
}
           │
           ▼
useFloors Hook: createFloor(data) {
  - Calls floorApi.create(data)
  - Updates state with new floor
}
           │
           ▼
floorApi.create(data) {
  - Calls apiClient.post<Floor>('/floors', data)
}
           │
           ▼
apiClient.post() {
  - Makes HTTP request:
    POST http://localhost:5001/api/v1/floors
    Body: { floor_name, floor_number, description }
    Headers: { Content-Type: application/json }
}
           │
           ▼ Network
           
           ▼ Network
           │
           ▼
Express Server Receives POST /floors
           │
           ▼
floorsRouter.post('/') {
  - Calls floorController.create()
}
           │
           ▼
floorController.create() {
  - Validates request body
  - Calls floorService.createFloor()
}
           │
           ▼
floorService.createFloor() {
  - Business logic
  - Calls floorRepository.create()
}
           │
           ▼
floorRepository.create() {
  - Creates Floor document
  - Saves to MongoDB
  - Returns created floor with ID
}
           │
           ▼
MongoDB Saves Document
{
  _id: ObjectId(...),
  floor_name: "Tầng 2",
  floor_number: 2,
  description: "Second Floor",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
           │
           ▼
Returns to Service
           │
           ▼
Service Returns to Controller
           │
           ▼
Controller Formats Response
{
  success: true,
  data: { id, floor_name, floor_number, description, createdAt, updatedAt },
  message: "Floor created successfully"
}
           │
           ▼ Network
           
           ▼ Network
           │
           ▼
Frontend Receives Response (200/201)
           │
           ▼
apiClient.post() returns { success, data, message }
           │
           ▼
floorApi.create() returns response
           │
           ▼
useFloors.createFloor() {
  - Updates floors state
  - Returns new floor
}
           │
           ▼
handleSubmitFloor() {
  - Catches response
  - Shows toast: "Đã thêm tầng mới thành công"
  - Closes modal
}
           │
           ▼
Component Re-renders
           │
           ▼
New Floor Appears in List
           │
           ▼ (Done!)
```

## State Management Flow

```
Initial State
│
├─ floors: []
├─ loading: true
└─ error: null
│
▼ (useEffect fetches floors on mount)
│
API Call: GET /floors
│
▼
Loading State
│
├─ floors: []
├─ loading: true
└─ error: null
│
▼ (API response received)
│
Success State
│
├─ floors: [ Floor[], Floor[], ... ]
├─ loading: false
└─ error: null
│
▼ (User clicks create)
│
API Call: POST /floors
│
▼ (API response received)
│
Updated State
│
├─ floors: [ Floor[], Floor[], ...NewFloor ]
├─ loading: false
└─ error: null
│
▼ Component Re-renders
│
List Shows New Floor
```

## Error Handling Flow

```
User Action
│
▼
API Call (fetch)
│
▼ (Network Error / Server Error)
│
Error Caught
│
▼
apiClient throws Error
│
▼
floorApi.create() throws Error
│
▼
useFloors.createFloor() catches error
│
▼
State Updated
│
├─ error: "error message"
└─ loading: false
│
▼
Component Renders Error UI
│
├─ Error Alert Card
├─ Error Message
└─ Retry Button
│
▼ (User clicks retry)
│
Re-execute API Call
```

## Component Lifecycle

```
Component Mounts
│
▼
useFloors Hook Runs
│
├─ useState initializes state
├─ useEffect runs
└─ fetchFloors() called
│
▼
API Call: GET /floors
│
State: loading = true
│
▼
Response Received
│
State Updated
│
├─ floors: [...]
├─ loading: false
└─ error: null
│
▼
Component Re-renders with Floors
│
▼
User Interacts (create/edit/delete)
│
▼
Hook Methods Called
│
├─ createFloor(data) → POST
├─ updateFloor(id, data) → PUT
└─ deleteFloor(id) → DELETE
│
▼
State Updated
│
Component Re-renders with New Data
│
▼
User Sees Changes Immediately
```

## File Dependencies

```
LocationManagement.tsx
│
├─ imports useFloors from hooks/useFloors.ts
│   │
│   └─ imports floorApi from lib/floorApi.ts
│       │
│       └─ imports apiClient from lib/apiClient.ts
│
├─ imports Floor from types/index.ts
├─ imports UI components (Button, Modal, Card, etc.)
├─ imports icons (Lucide React)
├─ imports toast notifications
├─ imports validators from lib/validation.ts
└─ imports ConfirmationModal
```

## Environment Configuration

```
Development Environment (.env.local)
│
├─ VITE_API_URL = "http://localhost:5001/api/v1"
│
▼
apiClient.ts
│
├─ Reads VITE_API_URL from import.meta.env
├─ Falls back to default if not set
└─ Uses for all HTTP requests

Example Request:
GET http://localhost:5001/api/v1/floors
```

## Summary

The integration follows a clean, layered architecture:

1. **Component Layer** - React components handle UI and user interactions
2. **Hook Layer** - Custom hooks manage state and side effects
3. **Service Layer** - API services provide domain-specific methods
4. **Client Layer** - Generic HTTP client handles all network requests
5. **Backend** - Express.js API with 4-layer architecture
6. **Database** - MongoDB stores all data

This separation of concerns makes the code:
- ✅ Easy to test
- ✅ Easy to maintain
- ✅ Easy to extend
- ✅ Highly reusable
- ✅ Type-safe with TypeScript

Enjoy your integrated restaurant management system! 🎉
