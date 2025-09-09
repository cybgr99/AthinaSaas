import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Dialog,
  IconButton,
  LinearProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import axios from 'axios';
import CustomerForm from '../components/CustomerForm';
import ImportDialog from '../components/ImportDialog';

const Customers = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['customers', page, pageSize, search],
    async () => {
      const response = await axios.get('/api/customers', {
        params: {
          page: page + 1,
          limit: pageSize,
          search
        }
      });
      return response.data;
    }
  );

  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/customers/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
      }
    }
  );

  const handleDelete = async (id) => {
    if (window.confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον πελάτη;')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert(error.response?.data?.error || 'Σφάλμα κατά τη διαγραφή πελάτη');
      }
    }
  };

  const columns = [
    { field: 'fullName', headerName: 'Ονοματεπώνυμο', flex: 1 },
    { field: 'companyName', headerName: 'Επωνυμία', flex: 1 },
    { field: 'vatNumber', headerName: 'ΑΦΜ', width: 120 },
    { field: 'phone', headerName: 'Τηλέφωνο', width: 150 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'balance',
      headerName: 'Υπόλοιπο',
      width: 120,
      valueFormatter: (params) => 
        `€${Number(params.value).toFixed(2)}`
    },
    {
      field: 'actions',
      headerName: 'Ενέργειες',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => {
              setSelectedCustomer(params.row);
              setOpenForm(true);
            }}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            size="small"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Πελάτες</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setOpenImport(true)}
            sx={{ mr: 1 }}
          >
            Εισαγωγή
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedCustomer(null);
              setOpenForm(true);
            }}
          >
            Νέος Πελάτης
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Αναζήτηση πελατών..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.response?.data?.error || 'Σφάλμα κατά τη φόρτωση πελατών'}
        </Alert>
      )}

      <Card>
        <DataGrid
          rows={data?.customers || []}
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
        maxWidth="sm"
        fullWidth
      >
        <CustomerForm
          customer={selectedCustomer}
          onClose={() => setOpenForm(false)}
          onSuccess={() => {
            setOpenForm(false);
            queryClient.invalidateQueries('customers');
          }}
        />
      </Dialog>

      <Dialog
        open={openImport}
        onClose={() => setOpenImport(false)}
        maxWidth="md"
        fullWidth
      >
        <ImportDialog
          type="customers"
          onClose={() => setOpenImport(false)}
          onSuccess={() => {
            setOpenImport(false);
            queryClient.invalidateQueries('customers');
          }}
        />
      </Dialog>
    </Box>
  );
};

export default Customers;
