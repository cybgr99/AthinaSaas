export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('el-GR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(date));
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('el-GR').format(number);
};
