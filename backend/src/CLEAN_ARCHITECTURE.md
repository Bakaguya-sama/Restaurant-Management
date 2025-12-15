# Clean Architecture Layering (Applied to Inventory & Suppliers)

## Layers
- **domain_layer**: Entities and business rules (no DB, no HTTP)
- **infrastructure_layer**: Direct DB access via Mongoose models
- **application_layer**: Business logic / use-cases, calls repositories
- **presentation_layer**: HTTP controllers and routes

## Call Flow
Route → Controller → Service → Repository → Model

## Files added (examples)
- `domain_layer/inventory/inventory.entity.js`
- `infrastructure_layer/inventory/inventory.repository.js`
- `application_layer/inventory/inventory.service.js`
- `presentation_layer/controllers/inventory/inventory.controller.js`
- `presentation_layer/routes/inventory.routes.js`

(Same pattern for `supplier` module.)

## How to migrate another module safely
1. Create `domain_layer/<module>/<module>.entity.js` with entity classes.
2. Create `infrastructure_layer/<module>/<module>.repository.js` with DB functions that use existing Mongoose models.
3. Create `application_layer/<module>/<module>.service.js` that implements use-cases and validation; call repository functions.
4. Create `presentation_layer/controllers/<module>/<module>.controller.js` that handles `req/res` and calls service functions. Keep response format identical to existing controllers.
5. Create `presentation_layer/routes/<module>.routes.js` to define routes and point to the new controller.
6. Replace `src/routes/<module>.js` to re-export the new router (minimal change), or update `src/server.js` route import to point to new router.
7. Run server and test endpoints (manual or automated tests).

## Notes & Rules
- Do not change database schemas or endpoint signatures.
- Keep error messages and status codes the same.
- Move logic incrementally and keep old controllers until new ones are verified.
- Keep names and messages consistent to maintain backward compatibility.

## Verification
- Start the server and verify the same routes appear under `INVENTORY MANAGEMENT` and `SUPPLIERS` sections.
- Run existing API clients/integration tests to confirm behavior unchanged.
