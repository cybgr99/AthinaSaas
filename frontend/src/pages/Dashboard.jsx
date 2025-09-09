import React from 'react';
import { useQuery } from 'react-query';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Euro as EuroIcon
} from '@mui/icons-material';
import axios from 'axios';

const StatCard = ({ title, value, icon: Icon, isLoading, error }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Grid>
        <Grid item xs>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {isLoading ? (
            <CircularProgress size={20} />
          ) : error ? (
            <Typography color="error">Σφάλμα φόρτωσης</Typography>
          ) : (
            <Typography variant="h4">{value}</Typography>
          )}
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery('dashboardStats', async () => {
    const response = await axios.get('/api/stats/dashboard');
    return response.data;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Πίνακας Ελέγχου
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Σύνολο Πελατών"
            value={stats?.totalCustomers || 0}
            icon={PeopleIcon}
            isLoading={isLoading}
            error={error}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Σύνολο Παραγγελιών"
            value={stats?.totalOrders || 0}
            icon={OrdersIcon}
            isLoading={isLoading}
            error={error}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Ενεργά Υπόλοιπα"
            value={stats?.totalBalance ? 
              `€${stats.totalBalance.toFixed(2)}` : 
              '€0.00'
            }
            icon={EuroIcon}
            isLoading={isLoading}
            error={error}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
