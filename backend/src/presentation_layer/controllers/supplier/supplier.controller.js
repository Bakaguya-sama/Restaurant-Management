const supplierService = require('../../../application_layer/supplier/supplier.service');

function success(res, data, message) {
  return res.json({ success: true, data, message });
}

function error(res, status = 400, message = 'Bad Request') {
  return res.status(status).json({ success: false, data: null, message });
}

exports.listSuppliers = async (req, res) => {
  try {
    const data = await supplierService.listSuppliers();
    return success(res, data, 'Suppliers retrieved');
  } catch (err) {
    console.error('listSuppliers error', err);
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message || 'Internal Server Error' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const result = await supplierService.createSupplier({ name, phone, address });
    return res.status(201).json({ success: true, data: result, message: 'Supplier created' });
  } catch (err) {
    console.error('createSupplier error', err);
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message || 'Internal Server Error' });
  }
};
