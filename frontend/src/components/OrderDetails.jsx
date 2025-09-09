import React from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider
} from '@mui/material';

const statusColors = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'error'
};

const statusLabels = {
  pending: 'Εκκρεμεί',
  completed: 'Ολοκληρώθηκε',
  cancelled: 'Ακυρώθηκε'
};

const OrderDetails = ({ order, onClose }) => {
  if (!order) return null;

  const calculateTotalPaid = () => {
    return order.Transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const calculateBalance = () => {
    const totalPaid = calculateTotalPaid();
    return Number(order.totalAmount) - totalPaid;
  };

  return (
    <>
      <DialogTitle>
        Λεπτομέρειες Παραγγελίας
        <Chip
          label={statusLabels[order.status]}
          color={statusColors[order.status]}
          size="small"
          sx={{ ml: 2 }}
        />
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Στοιχεία Πελάτη
              </Typography>
              <Typography variant="body1">
                {order.Customer.companyName ? (
                  <>
                    {order.Customer.fullName}
                    <br />
                    {order.Customer.companyName}
                  </>
                ) : (
                  order.Customer.fullName
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ΑΦΜ: {order.Customer.vatNumber}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Στοιχεία Παραγγελίας
              </Typography>
              <Typography variant="body2">
                Ημερομηνία: {new Date(order.orderDate).toLocaleString('el-GR')}
              </Typography>
              {order.notes && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Σημειώσεις: {order.notes}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Προϊόντα
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Προϊόν</TableCell>
                      <TableCell align="right">Τιμή</TableCell>
                      <TableCell align="right">Ποσότητα</TableCell>
                      <TableCell align="right">Σύνολο</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.OrderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.Product.name}
                          <Typography variant="caption" display="block" color="text.secondary">
                            SKU: {item.Product.sku}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">€{Number(item.unitPrice).toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">€{Number(item.totalPrice).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3}>Κόστος Αποστολής</TableCell>
                      <TableCell align="right">€{Number(order.shippingCost).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <strong>Συνολικό Ποσό</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>€{Number(order.totalAmount).toFixed(2)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {order.Transactions.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Συναλλαγές
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ημερομηνία</TableCell>
                        <TableCell>Τύπος</TableCell>
                        <TableCell>Τρόπος Πληρωμής</TableCell>
                        <TableCell align="right">Ποσό</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.Transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleString('el-GR')}
                          </TableCell>
                          <TableCell>
                            {transaction.type === 'payment' ? 'Πληρωμή' : 'Επιστροφή'}
                          </TableCell>
                          <TableCell>{transaction.paymentMethod}</TableCell>
                          <TableCell align="right">
                            €{Math.abs(Number(transaction.amount)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3}>
                          <strong>Υπόλοιπο</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>€{calculateBalance().toFixed(2)}</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Κλείσιμο
        </Button>
      </DialogActions>
    </>
  );
};

export default OrderDetails;
