import React, { useState, useRef } from 'react';
import { useMutation } from 'react-query';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Step,
  Stepper,
  StepLabel,
  Link
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';

const steps = ['Επιλογή Αρχείου', 'Προεπισκόπηση', 'Εισαγωγή'];

const ImportDialog = ({ type, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const previewMutation = useMutation(
    async (formData) => {
      const response = await axios.post('/api/imports/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        setPreviewData(data);
        setActiveStep(1);
      },
      onError: (error) => {
        setError(error.response?.data?.error || 'Σφάλμα κατά την προεπισκόπηση');
      }
    }
  );

  const importMutation = useMutation(
    async (formData) => {
      const response = await axios.post('/api/imports/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        setActiveStep(2);
        onSuccess();
      },
      onError: (error) => {
        setError(error.response?.data?.error || 'Σφάλμα κατά την εισαγωγή');
      }
    }
  );

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(csv|xlsx)$/)) {
        setError('Μη έγκυρος τύπος αρχείου. Υποστηρίζονται μόνο αρχεία .csv και .xlsx');
        return;
      }
      setFile(selectedFile);
      setError('');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', type);
      previewMutation.mutate(formData);
    }
  };

  const handleImport = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    importMutation.mutate(formData);
  };

  const downloadTemplate = () => {
    const headers = type === 'customers' 
      ? ['Ονοματεπώνυμο', 'Επωνυμία', 'ΑΦΜ', 'Διεύθυνση', 'Email', 'Τηλέφωνο', 'Σημειώσεις']
      : ['Όνομα', 'Κατηγορία', 'Περιγραφή', 'Τιμή', 'Κωδικός'];

    const csvContent = headers.join(',') + '\\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${type}.csv`;
    link.click();
  };

  return (
    <>
      <DialogTitle>
        Εισαγωγή {type === 'customers' ? 'Πελατών' : 'Προϊόντων'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ width: '100%', mt: 2 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 4 }}>
            {activeStep === 0 && (
              <Box sx={{ textAlign: 'center' }}>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current.click()}
                  disabled={previewMutation.isLoading}
                  sx={{ mb: 2 }}
                >
                  Επιλογή Αρχείου
                </Button>
                {previewMutation.isLoading && (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Υποστηριζόμενοι τύποι αρχείων: .csv, .xlsx
                </Typography>
                <Link
                  component="button"
                  variant="body2"
                  onClick={downloadTemplate}
                  sx={{ mt: 1, display: 'block' }}
                >
                  Λήψη προτύπου
                </Link>
              </Box>
            )}

            {activeStep === 1 && previewData && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Προεπισκόπηση Δεδομένων
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Σύνολο εγγραφών: {previewData.totalRecords}
                  <br />
                  Έγκυρες εγγραφές: {previewData.validRecords}
                  <br />
                  {previewData.errors.length > 0 && (
                    <>
                      Σφάλματα: {previewData.errors.length}
                      <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {previewData.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {previewData.errors.length > 5 && (
                            <li>... και {previewData.errors.length - 5} ακόμη</li>
                          )}
                        </ul>
                      </Alert>
                    </>
                  )}
                </Typography>

                {previewData.preview.length > 0 && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {Object.keys(previewData.preview[0]).map((key) => (
                            <TableCell key={key}>{key}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {previewData.preview.map((row, index) => (
                          <TableRow key={index}>
                            {Object.values(row).map((value, i) => (
                              <TableCell key={i}>{value}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Η εισαγωγή ολοκληρώθηκε επιτυχώς!
                </Typography>
                <Typography variant="body1">
                  Μπορείτε να κλείσετε αυτό το παράθυρο.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {activeStep === 2 ? 'Κλείσιμο' : 'Ακύρωση'}
        </Button>
        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={importMutation.isLoading || previewData.errors.length > 0}
          >
            {importMutation.isLoading ? (
              <>
                Εισαγωγή...
                <CircularProgress size={24} sx={{ ml: 1 }} />
              </>
            ) : (
              'Εισαγωγή'
            )}
          </Button>
        )}
      </DialogActions>
    </>
  );
};

export default ImportDialog;
