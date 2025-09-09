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
  Alert
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object({
  fullName: Yup.string()
    .required('Το ονοματεπώνυμο είναι υποχρεωτικό'),
  vatNumber: Yup.string()
    .matches(/^\d{9}$/, 'Το ΑΦΜ πρέπει να έχει 9 ψηφία')
    .required('Το ΑΦΜ είναι υποχρεωτικό'),
  email: Yup.string()
    .email('Μη έγκυρη διεύθυνση email')
    .nullable(),
  phone: Yup.string()
    .matches(/^[+\d\s-()]{10,}$/, 'Μη έγκυρος αριθμός τηλεφώνου')
    .nullable()
});

const CustomerForm = ({ customer, onClose, onSuccess }) => {
  const initialValues = {
    fullName: customer?.fullName || '',
    companyName: customer?.companyName || '',
    vatNumber: customer?.vatNumber || '',
    address: customer?.address || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    notes: customer?.notes || ''
  };

  const createMutation = useMutation(
    (data) => axios.post('/api/customers', data),
    {
      onSuccess: () => {
        onSuccess();
      }
    }
  );

  const updateMutation = useMutation(
    (data) => axios.put(`/api/customers/${customer.id}`, data),
    {
      onSuccess: () => {
        onSuccess();
      }
    }
  );

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      if (customer) {
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
        status
      }) => (
        <Form>
          <DialogTitle>
            {customer ? 'Επεξεργασία Πελάτη' : 'Νέος Πελάτης'}
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
                    name="fullName"
                    label="Ονοματεπώνυμο"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.fullName && Boolean(errors.fullName)}
                    helperText={touched.fullName && errors.fullName}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="companyName"
                    label="Επωνυμία"
                    value={values.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="vatNumber"
                    label="ΑΦΜ"
                    value={values.vatNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.vatNumber && Boolean(errors.vatNumber)}
                    helperText={touched.vatNumber && errors.vatNumber}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="Τηλέφωνο"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="address"
                    label="Διεύθυνση"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="notes"
                    label="Σημειώσεις"
                    multiline
                    rows={3}
                    value={values.notes}
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
              {customer ? 'Αποθήκευση' : 'Δημιουργία'}
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  );
};

export default CustomerForm;
