import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Autocomplete,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const OrderForm = ({ onClose, onSuccess }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  // Fetch customers for autocomplete
  const { data: customers } = useQuery('customers', async () => {
    const response = await axios.get('/api/customers');
    return response.data.customers;
  });

  // Fetch products for autocomplete
  const { data: products } = useQuery('products', async () => {
    const response = await axios.get('/api/products');
    return response.data.products;
  });

  const createOrderMutation = useMutation(
    (orderData) => axios.post('/api/orders', orderData),
    {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        setError(error.response?.data?.error || 'Σφάλμα κατά τη δημιουργία παραγγελίας');
      }
    }
  );

  const handleAddItem = () => {
    if (!selectedProduct || quantity < 1) return;

    const existingItem = items.find(item => item.productId === selectedProduct.id);
    if (existingItem) {
      setItems(items.map(item =>
        item.productId === selectedProduct.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setItems([...items, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity
      }]);
    }

    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveItem = (productId) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return itemsTotal + Number(shippingCost);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      setError('Παρακαλώ επιλέξτε πελάτη');
      return;
    }
    if (items.length === 0) {
      setError('Παρακαλώ προσθέστε τουλάχιστον ένα προϊόν');
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        customerId: selectedCustomer.id,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingCost: Number(shippingCost),
        notes
      });
    } catch (error) {
      // Error is handled by mutation
    }
  };

  return (
    <>
      <DialogTitle>Νέα Παραγγελία</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={customers || []}
                getOptionLabel={(option) => 
                  option.companyName ? 
                    `${option.fullName} (${option.companyName})` : 
                    option.fullName
                }
                value={selectedCustomer}
                onChange={(_, newValue) => setSelectedCustomer(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Πελάτης"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Προϊόντα
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={products || []}
                    getOptionLabel={(option) => `${option.name} (${option.sku})`}
                    value={selectedProduct}
                    onChange={(_, newValue) => setSelectedProduct(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Προϊόν"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Ποσότητα"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddItem}
                    disabled={!selectedProduct}
                    sx={{ height: '56px' }}
                  >
                    Προσθήκη
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Προϊόν</TableCell>
                      <TableCell align="right">Τιμή</TableCell>
                      <TableCell align="right">Ποσότητα</TableCell>
                      <TableCell align="right">Σύνολο</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">€{item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          €{(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(item.productId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3}>Κόστος Αποστολής</TableCell>
                      <TableCell align="right" colSpan={2}>
                        <TextField
                          size="small"
                          type="number"
                          value={shippingCost}
                          onChange={(e) => setShippingCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          InputProps={{
                            inputProps: { min: 0, step: 0.01 },
                            startAdornment: <span>€</span>
                          }}
                          sx={{ width: '100px' }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <strong>Συνολικό Ποσό</strong>
                      </TableCell>
                      <TableCell align="right" colSpan={2}>
                        <strong>€{calculateTotal().toFixed(2)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

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
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createOrderMutation.isLoading}
        >
          Δημιουργία
        </Button>
      </DialogActions>
    </>
  );
};

export default OrderForm;
