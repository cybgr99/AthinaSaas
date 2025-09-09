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
  MenuItem,
  InputAdornment,
  Grid
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
import ProductForm from '../components/ProductForm';
import ImportDialog from '../components/ImportDialog';

const Products = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['products', page, pageSize, search, category],
    async () => {
      const response = await axios.get('/api/products', {
        params: {
          page: page + 1,
          limit: pageSize,
          search,
          category: category || undefined
        }
      });
      return response.data;
    }
  );

  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/products/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
      }
    }
  );

  const handleDelete = async (id) => {
    if (window.confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το προϊόν;')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert(error.response?.data?.error || 'Σφάλμα κατά τη διαγραφή προϊόντος');
      }
    }
  };

  const columns = [
    { field: 'sku', headerName: 'Κωδικός', width: 120 },
    { field: 'name', headerName: 'Όνομα', flex: 1 },
    { field: 'category', headerName: 'Κατηγορία', width: 150 },
    {
      field: 'price',
      headerName: 'Τιμή',
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
              setSelectedProduct(params.row);
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
        <Typography variant="h4">Προϊόντα & Υπηρεσίες</Typography>
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
              setSelectedProduct(null);
              setOpenForm(true);
            }}
          >
            Νέο Προϊόν
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Αναζήτηση προϊόντων..."
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
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Κατηγορία"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">Όλες οι κατηγορίες</MenuItem>
                {data?.categories?.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </Card>

      <Card>
        <DataGrid
          rows={data?.products || []}
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
        <ProductForm
          product={selectedProduct}
          categories={data?.categories || []}
          onClose={() => setOpenForm(false)}
          onSuccess={() => {
            setOpenForm(false);
            queryClient.invalidateQueries('products');
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
          type="products"
          onClose={() => setOpenImport(false)}
          onSuccess={() => {
            setOpenImport(false);
            queryClient.invalidateQueries('products');
          }}
        />
      </Dialog>
    </Box>
  );
};

export default Products;
