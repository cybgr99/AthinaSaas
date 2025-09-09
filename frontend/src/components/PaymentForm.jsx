import React, { useState } from 'react';
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
  Typography,
  MenuItem
} from '@mui/material';
import axios from 'axios';

const paymentMethods = [
  { value: 'cash', label: 'Μετρητά' },
  { value: 'card', label: 'Κάρτα' },
  { value: 'bank_transfer', label: 'Τραπεζική Κατάθεση' },
  { value: 'check', label: 'Επιταγή' }
];

const PaymentForm = ({ order, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const paymentMutation = useMutation(
    (data) => axios.post(`/api/orders/${order.id}/payments`, data),
    {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        setError(error.response?.data?.error || 'Σφάλμα κατά την καταχώρηση πληρωμής');
      }
    }
  );

  const refundMutation = useMutation(
    (data) => axios.post(`/api/orders/${order.id}/refunds`, data),
    {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        setError(error.response?.data?.error || 'Σφάλμα κατά την καταχώρηση επιστροφής');
      }
    }
  );

  const calculateBalance = () => {
    const totalPaid = order.Transactions
      ?.filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    return Number(order.totalAmount) - totalPaid;
  };

  const handleSubmit = async (isRefund = false) => {
    if (!amount || amount <= 0) {
      setError('Παρακαλώ εισάγετε έγκυρο ποσό');
      return;
    }
    if (!paymentMethod && !isRefund) {
      setError('Παρακαλώ επιλέξτε τρόπο πληρωμής');
      return;
    }

    try {
      if (isRefund) {
        await refundMutation.mutateAsync({
          amount: Number(amount),
          reason: notes
        });
      } else {
        await paymentMutation.mutateAsync({
          amount: Number(amount),
          paymentMethod,
          notes
        });
      }
    } catch (error) {
      // Error is handled by mutation
    }
  };

  return (
    <>
      <DialogTitle>
        Καταχώρηση {order.status === 'completed' ? 'Επιστροφής' : 'Πληρωμής'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Στοιχεία Παραγγελίας
              </Typography>
              <Typography variant="body1">
                Συνολικό Ποσό: €{Number(order.totalAmount).toFixed(2)}
              </Typography>
              <Typography variant="body1">
                Υπόλοιπο: €{calculateBalance().toFixed(2)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ποσό"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                  startAdornment: <span>€</span>
                }}
                required
              />
            </Grid>

            {order.status !== 'completed' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Τρόπος Πληρωμής"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  {paymentMethods.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Σημειώσεις"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Ακύρωση
        </Button>
        {order.status === 'completed' ? (
          <Button
            variant="contained"
            color="error"
            onClick={() => handleSubmit(true)}
            disabled={refundMutation.isLoading}
          >
            Επιστροφή
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => handleSubmit(false)}
            disabled={paymentMutation.isLoading}
          >
            Καταχώρηση
          </Button>
        )}
      </DialogActions>
    </>
  );
};

export default PaymentForm;
