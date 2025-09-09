import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import { Readable } from 'stream';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to parse Excel files
const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
};

// Helper function to parse CSV files
const parseCsv = async (buffer) => {
  const records = [];
  const parser = parse({
    delimiter: ',',
    skip_empty_lines: true
  });

  return new Promise((resolve, reject) => {
    Readable.from(buffer)
      .pipe(parser)
      .on('data', (record) => records.push(record))
      .on('end', () => resolve(records))
      .on('error', reject);
  });
};

// Validate and process customer data
const validateCustomerData = (data) => {
  const required = ['fullName', 'vatNumber'];
  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const customer = {};
    let hasError = false;

    // Map fields
    customer.fullName = row.fullName || row['Ονοματεπώνυμο'];
    customer.companyName = row.companyName || row['Επωνυμία'];
    customer.vatNumber = row.vatNumber || row['ΑΦΜ'];
    customer.address = row.address || row['Διεύθυνση'];
    customer.email = row.email || row['Email'];
    customer.phone = row.phone || row['Τηλέφωνο'];
    customer.notes = row.notes || row['Σημειώσεις'];

    // Validate required fields
    required.forEach(field => {
      if (!customer[field]) {
        errors.push(`Γραμμή ${index + 1}: Το πεδίο ${field} είναι υποχρεωτικό`);
        hasError = true;
      }
    });

    // Validate VAT number format
    if (customer.vatNumber && !/^\d{9}$/.test(customer.vatNumber)) {
      errors.push(`Γραμμή ${index + 1}: Μη έγκυρο ΑΦΜ`);
      hasError = true;
    }

    // Validate email format
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.push(`Γραμμή ${index + 1}: Μη έγκυρο email`);
      hasError = true;
    }

    if (!hasError) {
      validData.push(customer);
    }
  });

  return { errors, validData };
};

// Validate and process product data
const validateProductData = (data) => {
  const required = ['name', 'sku', 'price'];
  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const product = {};
    let hasError = false;

    // Map fields
    product.name = row.name || row['Όνομα'];
    product.category = row.category || row['Κατηγορία'];
    product.description = row.description || row['Περιγραφή'];
    product.price = row.price || row['Τιμή'];
    product.sku = row.sku || row['Κωδικός'];

    // Validate required fields
    required.forEach(field => {
      if (!product[field]) {
        errors.push(`Γραμμή ${index + 1}: Το πεδίο ${field} είναι υποχρεωτικό`);
        hasError = true;
      }
    });

    // Validate price format
    if (isNaN(parseFloat(product.price))) {
      errors.push(`Γραμμή ${index + 1}: Μη έγκυρη τιμή`);
      hasError = true;
    } else {
      product.price = parseFloat(product.price);
    }

    if (!hasError) {
      validData.push(product);
    }
  });

  return { errors, validData };
};

// Preview import data
router.post('/preview', [auth, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Δεν βρέθηκε αρχείο' });
    }

    const { type } = req.body;
    if (!['customers', 'products'].includes(type)) {
      return res.status(400).json({ error: 'Μη έγκυρος τύπος εισαγωγής' });
    }

    let data;
    if (req.file.originalname.endsWith('.xlsx')) {
      data = parseExcel(req.file.buffer);
      // Remove header row
      data.shift();
    } else if (req.file.originalname.endsWith('.csv')) {
      data = await parseCsv(req.file.buffer);
      // Remove header row
      data.shift();
    } else {
      return res.status(400).json({ error: 'Μη υποστηριζόμενος τύπος αρχείου' });
    }

    // Convert array format to object format using headers
    const records = data.map(row => {
      const record = {};
      row.forEach((value, index) => {
        record[`field${index}`] = value;
      });
      return record;
    });

    const validation = type === 'customers' 
      ? validateCustomerData(records)
      : validateProductData(records);

    res.json({
      totalRecords: records.length,
      validRecords: validation.validData.length,
      errors: validation.errors,
      preview: validation.validData.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά την ανάλυση του αρχείου' });
  }
});

// Process import
router.post('/process', [auth, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Δεν βρέθηκε αρχείο' });
    }

    const { type } = req.body;
    if (!['customers', 'products'].includes(type)) {
      return res.status(400).json({ error: 'Μη έγκυρος τύπος εισαγωγής' });
    }

    let data;
    if (req.file.originalname.endsWith('.xlsx')) {
      data = parseExcel(req.file.buffer);
      data.shift(); // Remove header row
    } else if (req.file.originalname.endsWith('.csv')) {
      data = await parseCsv(req.file.buffer);
      data.shift(); // Remove header row
    } else {
      return res.status(400).json({ error: 'Μη υποστηριζόμενος τύπος αρχείου' });
    }

    // Convert array format to object format
    const records = data.map(row => {
      const record = {};
      row.forEach((value, index) => {
        record[`field${index}`] = value;
      });
      return record;
    });

    const validation = type === 'customers' 
      ? validateCustomerData(records)
      : validateProductData(records);

    if (validation.errors.length > 0) {
      return res.status(400).json({
        error: 'Βρέθηκαν σφάλματα στα δεδομένα',
        errors: validation.errors
      });
    }

    let imported = 0;
    let updated = 0;
    let failed = 0;

    if (type === 'customers') {
      for (const customer of validation.validData) {
        try {
          const [record, created] = await Customer.upsert(customer, {
            returning: true
          });
          if (created) {
            imported++;
          } else {
            updated++;
          }
        } catch (error) {
          failed++;
        }
      }
    } else {
      for (const product of validation.validData) {
        try {
          const [record, created] = await Product.upsert(product, {
            returning: true
          });
          if (created) {
            imported++;
          } else {
            updated++;
          }
        } catch (error) {
          failed++;
        }
      }
    }

    res.json({
      imported,
      updated,
      failed,
      total: validation.validData.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Σφάλμα κατά την εισαγωγή δεδομένων' });
  }
});

export default router;
