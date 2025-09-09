import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Dialog,
  MenuItem,
  Grid,
  Chip,
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Euro as EuroIcon
} from '@mui/icons-material';
import axios from 'axios';
import OrderForm from '../components/OrderForm';
import OrderDetails from '../components/OrderDetails';
import PaymentForm from '../components/PaymentForm';

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

const Orders = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery(
    ['orders', page, pageSize, statusFilter],
    async () => {
      const response = await axios.get('/api/orders', {
        params: {
          page: page + 1,
          limit: pageSize,
          status: statusFilter || undefined
        }
      });
      return response.data;
    }
  );

  const handleViewOrder = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
      setOpenDetails(true);
    } catch (error) {
      alert('Σφάλμα κατά την ανάκτηση της παραγγελίας');
    }
  };

  const columns = [
    {
      field: 'id',
      headerName: 'Αριθμός',
      width: 100,
      valueFormatter: (params) => params.value.slice(0, 8)
    },
    {
      field: 'Customer',
      headerName: 'Πελάτης',
      flex: 1,
      valueGetter: (params) => params.row.Customer?.fullName || params.row.Customer?.companyName
    },
    {
      field: 'orderDate',
      headerName: 'Ημερομηνία',
      width: 180,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleString('el-GR')
    },
    {
      field: 'totalAmount',
      headerName: 'Σύνολο',
      width: 120,
      valueFormatter: (params) =>
        `€${Number(params.value).toFixed(2)}`
    },
    {
      field: 'status',
      headerName: 'Κατάσταση',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={statusLabels[params.value]}
          color={statusColors[params.value]}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Ενέργειες',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleViewOrder(params.row.id)}
            size="small"
          >
            <ViewIcon />
          </IconButton>
          {params.row.status === 'pending' && (
            <IconButton
              onClick={() => {
                setSelectedOrder(params.row);
                setOpenPayment(true);
              }}
              size="small"
              color="primary"
            >
              <EuroIcon />
            </IconButton>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Παραγγελίες</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Νέα Παραγγελία
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Κατάσταση"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Όλες</MenuItem>
                <MenuItem value="pending">Εκκρεμείς</MenuItem>
                <MenuItem value="completed">Ολοκληρωμένες</MenuItem>
                <MenuItem value="cancelled">Ακυρωμένες</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </Card>

      <Card>
        <DataGrid
          rows={data?.orders || []}
          columns={columns}
          rowCount={data?.total || 0}
          loading={isLoading}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationMode="server"
          paginationModel={{
            page,
            pageSize
          }}
          onPaginationModelChange={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            }
          }}
        />
      </Card>

      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <OrderForm
          onClose={() => setOpenForm(false)}
          onSuccess={() => {
            setOpenForm(false);
            // Refresh orders list
          }}
        />
      </Dialog>

      <Dialog
        open={openDetails}
        onClose={() => {
          setOpenDetails(false);
          setSelectedOrder(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <OrderDetails
          order={selectedOrder}
          onClose={() => {
            setOpenDetails(false);
            setSelectedOrder(null);
          }}
        />
      </Dialog>

      <Dialog
        open={openPayment}
        onClose={() => {
          setOpenPayment(false);
          setSelectedOrder(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <PaymentForm
          order={selectedOrder}
          onClose={() => {
            setOpenPayment(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            setOpenPayment(false);
            setSelectedOrder(null);
            // Refresh orders list
          }}
        />
      </Dialog>
    </Box>
  );
};

export default Orders;
