import React from 'react';
import { useMutation } from 'react-query';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  MenuItem
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Το όνομα είναι υποχρεωτικό'),
  category: Yup.string()
    .required('Η κατηγορία είναι υποχρεωτική'),
  price: Yup.number()
    .required('Η τιμή είναι υποχρεωτική')
    .min(0, 'Η τιμή πρέπει να είναι θετικός αριθμός'),
  sku: Yup.string()
    .required('Ο κωδικός SKU είναι υποχρεωτικός')
});

const ProductForm = ({ product, categories = [], onClose, onSuccess }) => {
  const initialValues = {
    name: product?.name || '',
    category: product?.category || '',
    description: product?.description || '',
    price: product?.price || '',
    sku: product?.sku || ''
  };

  const createMutation = useMutation(
    (data) => axios.post('/api/products', data),
    {
      onSuccess: () => {
        onSuccess();
      }
    }
  );

  const updateMutation = useMutation(
    (data) => axios.put(`/api/products/${product.id}`, data),
    {
      onSuccess: () => {
        onSuccess();
      }
    }
  );

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      if (product) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }
    } catch (error) {
      setStatus({ error: error.response?.data?.error || 'Σφάλμα κατά την αποθήκευση' });
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isSubmitting,
        status,
        setFieldValue
      }) => (
        <Form>
          <DialogTitle>
            {product ? 'Επεξεργασία Προϊόντος' : 'Νέο Προϊόν'}
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {status?.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {status.error}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Όνομα"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="category"
                    label="Κατηγορία"
                    value={values.category}
                    onChange={(e) => {
                      setFieldValue('category', e.target.value);
                    }}
                    error={touched.category && Boolean(errors.category)}
                    helperText={touched.category && errors.category}
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                    {!categories.includes(values.category) && values.category && (
                      <MenuItem value={values.category}>
                        {values.category}
                      </MenuItem>
                    )}
                    <MenuItem value="new">
                      <em>Νέα Κατηγορία...</em>
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="sku"
                    label="Κωδικός (SKU)"
                    value={values.sku}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.sku && Boolean(errors.sku)}
                    helperText={touched.sku && errors.sku}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="price"
                    label="Τιμή (€)"
                    type="number"
                    value={values.price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.price && Boolean(errors.price)}
                    helperText={touched.price && errors.price}
                    required
                    InputProps={{
                      inputProps: { min: 0, step: 0.01 }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="description"
                    label="Περιγραφή"
                    multiline
                    rows={3}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose}>
              Ακύρωση
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {product ? 'Αποθήκευση' : 'Δημιουργία'}
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  );
};

export default ProductForm;
