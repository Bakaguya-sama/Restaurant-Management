# Payment Method Fix - Invoice Payment Flow

## 🔍 VẤN ĐỀ PHÁT HIỆN

### Mô tả vấn đề
Khi nhân viên thu ngân chọn phương thức thanh toán (tiền mặt/thẻ/ví điện tử) và xác nhận thanh toán, **payment_method KHÔNG được lưu vào database**. Hóa đơn được đánh dấu là đã thanh toán nhưng không có thông tin về phương thức thanh toán.

### Nguyên nhân gốc rễ

#### 1. **Backend API không nhận payment_method**
- Endpoint `PATCH /api/v1/invoices/:id/paid` chỉ cập nhật `payment_status` và `paid_at`
- Không có tham số để nhận `payment_method` từ request body
- Service layer không xử lý payment_method khi mark as paid

```javascript
// ❌ BEFORE - invoice.controller.js
async markAsPaid(req, res) {
  const invoice = await this.invoiceService.markAsPaid(req.params.id);
  // Không nhận payment_method
}

// ❌ BEFORE - invoice.service.js  
async markAsPaid(id) {
  return await this.invoiceRepository.updatePaymentStatus(id, 'paid', new Date());
  // Không truyền payment_method
}

// ❌ BEFORE - invoice.repository.js
async updatePaymentStatus(id, status, paidAt = null) {
  const updateData = { payment_status: status };
  if (paidAt) updateData.paid_at = paidAt;
  // Không có payment_method trong updateData
}
```

#### 2. **Frontend không gửi payment_method**
```typescript
// ❌ BEFORE - InvoicesPage.tsx
const handlePayment = async () => {
  await invoiceApi.markAsPaid(selectedInvoice.id);
  // Không gửi paymentMethod lên backend
}

// ❌ BEFORE - api.ts
markAsPaid: async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}/paid`, {
    method: 'PATCH',
    // Không có body
  });
}
```

#### 3. **Validation Logic không phù hợp**
```javascript
// ❌ BEFORE - invoice.entity.js
const validPaymentMethods = ['cash', 'card', 'transfer', 'e-wallet'];
if (!this.payment_method || !validPaymentMethods.includes(this.payment_method)) {
  errors.push('Invalid payment method');
}
// BẮT BUỘC payment_method ngay khi tạo invoice (pending)
// Nhưng thực tế payment_method chỉ được chọn khi thanh toán
```

## ✅ GIẢI PHÁP ĐÃ THỰC HIỆN

### 1. **Backend: Cập nhật API để nhận và lưu payment_method**

#### Controller Layer
```javascript
// ✅ AFTER - invoice.controller.js
async markAsPaid(req, res) {
  try {
    const { payment_method } = req.body; // Nhận payment_method từ body
    const invoice = await this.invoiceService.markAsPaid(req.params.id, payment_method);
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
```

#### Service Layer
```javascript
// ✅ AFTER - invoice.service.js
async markAsPaid(id, paymentMethod) {
  const invoice = await this.invoiceRepository.findById(id);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.payment_status === 'paid') {
    throw new Error('Invoice is already paid');
  }

  if (invoice.payment_status === 'cancelled') {
    throw new Error('Cannot mark cancelled invoice as paid');
  }

  // ✅ Validation payment_method
  if (!paymentMethod) {
    throw new Error('Payment method is required');
  }

  const validPaymentMethods = ['cash', 'card', 'transfer', 'e-wallet'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    throw new Error('Invalid payment method');
  }

  return await this.invoiceRepository.updatePaymentStatus(
    id, 
    'paid', 
    new Date(), 
    paymentMethod // ✅ Truyền payment_method
  );
}
```

#### Repository Layer
```javascript
// ✅ AFTER - invoice.repository.js
async updatePaymentStatus(id, status, paidAt = null, paymentMethod = null) {
  const updateData = { payment_status: status };
  if (paidAt) {
    updateData.paid_at = paidAt;
  }
  if (paymentMethod) {
    updateData.payment_method = paymentMethod; // ✅ Cập nhật payment_method
  }

  const invoice = await Invoice.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );
  
  if (!invoice) return null;
  return new InvoiceEntity(invoice.toObject());
}
```

### 2. **Entity: Cập nhật validation logic**

```javascript
// ✅ AFTER - invoice.entity.js
const validPaymentMethods = ['cash', 'card', 'transfer', 'e-wallet'];
if (this.payment_method && !validPaymentMethods.includes(this.payment_method)) {
  errors.push('Invalid payment method');
}

// ✅ Payment method CHỈ bắt buộc khi invoice đã thanh toán
if (this.payment_status === 'paid' && !this.payment_method) {
  errors.push('Payment method is required when invoice is paid');
}
```

**Logic mới:**
- Khi tạo invoice (status = 'pending'): payment_method là **OPTIONAL**
- Khi thanh toán (status = 'paid'): payment_method là **REQUIRED**

### 3. **Frontend: Gửi payment_method khi thanh toán**

#### InvoicesPage (Cashier)
```typescript
// ✅ AFTER - InvoicesPage.tsx
const handlePayment = async () => {
  if (!selectedInvoice) return;

  const totalAmount = finalTotal;

  if (
    paymentMethod === "cash" &&
    (!cashReceived || parseFloat(cashReceived) < totalAmount)
  ) {
    toast.error("Số tiền không đủ!");
    return;
  }

  const pointsEarned = Math.floor(totalAmount / 10000) * 10;

  // ✅ Map UI format sang backend format
  const paymentMethodMap: { [key: string]: string } = {
    cash: 'cash',
    card: 'card',
    wallet: 'e-wallet'
  };

  try {
    // ✅ Gửi payment_method
    await invoiceApi.markAsPaid(
      selectedInvoice.id, 
      paymentMethodMap[paymentMethod] || 'cash'
    );
    await fetchInvoices();
    
    // ... success handling
  } catch (error: any) {
    toast.error(error.message || 'Không thể thanh toán hóa đơn');
  }
};
```

#### BillsPage (Customer)
```typescript
// ✅ AFTER - BillsPage.tsx
try {
  const paymentMethodMap: any = {
    wallet: 'e-wallet',
    card: 'card',
    cash: 'cash',
    online: 'transfer',
  };

  await invoiceApi.update(selectedBill.invoiceId, {
    payment_method: paymentMethodMap[paymentMethod],
  });

  if (paymentMethod === 'cash') {
    toast.success("Đã gửi yêu cầu thanh toán! Vui lòng chờ nhân viên xác nhận.");
  } else {
    // ✅ Gửi payment_method khi auto-paid
    await invoiceApi.markAsPaid(
      selectedBill.invoiceId, 
      paymentMethodMap[paymentMethod]
    );
    
    // ... success handling
  }
} catch (error: any) {
  toast.error(error.message || "Thanh toán thất bại");
}
```

#### API Client
```typescript
// ✅ AFTER - api.ts
markAsPaid: async (id: string, paymentMethod: string) => {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}/paid`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payment_method: paymentMethod }), // ✅ Gửi trong body
  });
  return handleResponse<any>(response);
},
```

### 4. **Testing: Cập nhật integration tests**

```javascript
// ✅ invoice.integration.js
describe('PATCH /api/v1/invoices/:id/paid - Mark as Paid', () => {
  it('should mark invoice as paid with payment method', async () => {
    const response = await request(app)
      .patch(`/api/v1/invoices/${createdInvoiceId}/paid`)
      .send({ payment_method: 'card' }) // ✅ Gửi payment_method
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.payment_status).toBe('paid');
    expect(response.body.data.payment_method).toBe('card'); // ✅ Verify saved
    expect(response.body.data).toHaveProperty('paid_at');
  });

  it('should fail when payment method is missing', async () => {
    // ... create new invoice
    
    const response = await request(app)
      .patch(`/api/v1/invoices/${newInvoiceId}/paid`)
      .send({}) // ✅ Không gửi payment_method
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Payment method is required');
  });

  it('should fail with invalid payment method', async () => {
    // ... create new invoice
    
    const response = await request(app)
      .patch(`/api/v1/invoices/${newInvoiceId}/paid`)
      .send({ payment_method: 'invalid_method' }) // ✅ Invalid value
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid payment method');
  });
});
```

## 📊 PAYMENT METHOD MAPPING

### Frontend → Backend
| UI Display | Frontend Value | Backend Value | Description |
|------------|----------------|---------------|-------------|
| 💵 Tiền mặt | `cash` | `cash` | Cash payment |
| 💳 Thẻ | `card` | `card` | Card payment |
| 📱 Ví điện tử | `wallet` | `e-wallet` | E-wallet (Momo, ZaloPay, etc.) |
| 🌐 Online | `online` | `transfer` | Bank transfer |

### Backend Enum Values
```javascript
enum: ['cash', 'card', 'transfer', 'e-wallet']
```

## 🔄 PAYMENT FLOW

### 1. Cashier Payment Flow (InvoicesPage)
```
1. Customer requests payment → Invoice created with status='pending'
2. Cashier opens invoice detail
3. Cashier selects payment method: cash/card/wallet
4. If cash → Enter amount received
5. Click "Xác nhận thanh toán"
6. Frontend sends: PATCH /api/v1/invoices/{id}/paid
   Body: { payment_method: 'cash' | 'card' | 'e-wallet' }
7. Backend validates:
   - Invoice exists
   - Not already paid
   - Payment method is valid
8. Backend updates:
   - payment_status = 'paid'
   - payment_method = selected method
   - paid_at = current timestamp
9. Invoice saved with payment method
```

### 2. Customer Payment Flow (BillsPage)
```
1. Customer views bill
2. Customer clicks "Thanh toán"
3. Customer selects payment method: cash/card/wallet/online
4. If cash → Send payment request only (wait for cashier)
5. If online/card/wallet → Auto mark as paid
6. Frontend sends:
   - UPDATE invoice with payment_method
   - PATCH /api/v1/invoices/{id}/paid with payment_method
7. Backend processes same as cashier flow
8. Payment confirmed
```

## 🛡️ VALIDATION RULES

### Creating Invoice
- ✅ `payment_method` is **OPTIONAL**
- ✅ Can create invoice without payment method
- ✅ Status defaults to 'pending'

### Marking as Paid
- ❌ `payment_method` is **REQUIRED**
- ❌ Must be one of: 'cash', 'card', 'transfer', 'e-wallet'
- ❌ Cannot mark as paid without payment method
- ❌ Cannot mark already paid invoice
- ❌ Cannot mark cancelled invoice

### Entity Validation
```javascript
// When creating (pending)
payment_method: Optional
payment_status: 'pending' (default)

// When paying (paid)
payment_method: Required ← ✅ NEW RULE
payment_status: 'paid'
paid_at: Required
```

## 📝 FILES MODIFIED

### Backend
1. ✅ `backend/src/presentation_layer/controllers/invoice/invoice.controller.js`
   - Updated `markAsPaid()` to accept payment_method from request body

2. ✅ `backend/src/application_layer/invoice/invoice.service.js`
   - Updated `markAsPaid()` to validate and pass payment_method
   - Added validation for payment_method (required, valid enum)

3. ✅ `backend/src/infrastructure_layer/invoice/invoice.repository.js`
   - Updated `updatePaymentStatus()` to save payment_method

4. ✅ `backend/src/domain_layer/invoice/invoice.entity.js`
   - Updated validation: payment_method required only when paid

5. ✅ `backend/src/test/invoice/invoice.integration.js`
   - Added tests for payment_method in markAsPaid
   - Added tests for missing/invalid payment_method

### Frontend
1. ✅ `frontend/src/components/staff/cashier/InvoicesPage.tsx`
   - Updated `handlePayment()` to send payment_method
   - Added payment method mapping

2. ✅ `frontend/src/components/customer/BillsPage.tsx`
   - Updated online payment to send payment_method

3. ✅ `frontend/src/lib/api.ts`
   - Updated `markAsPaid()` signature to accept payment_method
   - Send payment_method in request body

## ✅ TESTING CHECKLIST

### Backend Tests
- [x] Create invoice without payment_method (should succeed)
- [x] Mark as paid with valid payment_method (should succeed)
- [x] Mark as paid without payment_method (should fail)
- [x] Mark as paid with invalid payment_method (should fail)
- [x] Mark already paid invoice (should fail)
- [x] Verify payment_method is saved in database

### Frontend Tests
- [ ] Select cash payment → verify 'cash' sent to backend
- [ ] Select card payment → verify 'card' sent to backend  
- [ ] Select wallet payment → verify 'e-wallet' sent to backend
- [ ] Customer online payment → verify 'transfer' sent to backend
- [ ] Verify payment_method displayed correctly after payment

### Integration Tests
- [ ] End-to-end: Create order → Create invoice → Pay with cash
- [ ] End-to-end: Create order → Create invoice → Pay with card
- [ ] End-to-end: Customer pay online → Auto mark as paid
- [ ] Verify payment statistics include payment_method data

## 🎯 IMPACT & BENEFITS

### Before Fix
- ❌ No payment method tracked
- ❌ Cannot generate payment method reports
- ❌ Cannot analyze payment preferences
- ❌ Audit trail incomplete

### After Fix
- ✅ All payments tracked with method
- ✅ Can generate payment method reports
- ✅ Can analyze customer payment preferences
- ✅ Complete audit trail
- ✅ Better business intelligence

## 📊 DATA MIGRATION

**Note:** Existing invoices with `payment_status='paid'` but no `payment_method` should be handled:

### Option 1: Set default value
```javascript
// Run once to update existing paid invoices without payment_method
db.invoices.updateMany(
  { 
    payment_status: 'paid', 
    payment_method: { $exists: false } 
  },
  { 
    $set: { payment_method: 'cash' } // Default to cash
  }
);
```

### Option 2: Mark as unknown
```javascript
// Add 'unknown' to enum temporarily
payment_method: { 
  type: String, 
  enum: ['cash', 'card', 'transfer', 'e-wallet', 'unknown'] 
}

// Update existing records
db.invoices.updateMany(
  { 
    payment_status: 'paid', 
    payment_method: { $exists: false } 
  },
  { 
    $set: { payment_method: 'unknown' } 
  }
);
```

## 🔍 FUTURE IMPROVEMENTS

1. **Analytics Dashboard**
   - Payment method distribution chart
   - Revenue by payment method
   - Payment method trends over time

2. **Reporting**
   - Daily payment method summary
   - Monthly payment method comparison
   - Export payment data by method

3. **Business Logic**
   - Apply different fees by payment method
   - Promotions based on payment method
   - Loyalty points multiplier by method

4. **Audit Trail**
   - Track payment method changes
   - Log who processed each payment
   - Payment method history

---

**Status:** ✅ COMPLETED  
**Date:** December 23, 2025  
**Version:** 1.0.0
