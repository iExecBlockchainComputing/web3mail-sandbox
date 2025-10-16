import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Fragment, useState } from 'react';
import { type Contact } from '@iexec/web3mail';
import { fetchMyContacts, sendMail } from './web3mail/web3mail';
import { SUPPORTED_CHAINS } from './web3mail/utils';
import { useWalletConnection } from './hooks/useWalletConnection';
import './styles.css';

export default function App() {
  const { isConnected, address } = useWalletConnection();
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0].id);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [displayTable, setdisplayTable] = useState(false);
  const [emailSentSuccess, setemailSentSuccess] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 5; // Number of contacts to display per page
  const pageLimit = 1;

  // Calculate the indexes of the contacts to display on the current page
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contacts.slice(
    indexOfFirstContact,
    indexOfLastContact
  );

  // Calculate the total number of pages
  const totalPages = Math.ceil(contacts.length / contactsPerPage);

  // Function to change the current page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Generate an array of page numbers to display in the pagination section
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const totalPagesDisplayed = Math.min(pageLimit, totalPages);

    let startPage = 1;
    let endPage = totalPagesDisplayed;

    if (currentPage > Math.floor(pageLimit / 2)) {
      startPage = currentPage - Math.floor(pageLimit / 2);
      endPage = startPage + pageLimit - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = endPage - pageLimit + 1;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handleChainChange = async (event: any) => {
    const newChainId = Number(event.target.value);
    setSelectedChain(newChainId);

    // Reset state when switching chains
    setContacts([]);
    setdisplayTable(false);
    setErrorMessage('');
    setemailSentSuccess(false);

    // Switch MetaMask to the selected chain
    try {
      const chain = SUPPORTED_CHAINS.find((c) => c.id === newChainId);
      if (!chain) return;

      const chainIdHex = `0x${newChainId.toString(16)}`;

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: unknown) {
        if ((switchError as { code?: number }).code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: chain.name,
                nativeCurrency: {
                  name: chain.tokenSymbol,
                  symbol: chain.tokenSymbol,
                  decimals: 18,
                },
                rpcUrls: chain.rpcUrls,
                blockExplorerUrls: [chain.blockExplorerUrl],
              },
            ],
          });
        }
      }
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  const handleLoadAddresses = async () => {
    try {
      setLoading(true);
      const { contacts: myContacts, error } =
        await fetchMyContacts(selectedChain);
      setLoading(false);
      if (error) {
        setErrorMessage(error);
        return;
      }
      setContacts(myContacts as Contact[]);
      setdisplayTable(true);
    } catch (err) {
      console.log('[fetchMyContacts] ERROR', err);
      setLoading(false);
      setErrorMessage(
        'Failed to load contacts. Please check your wallet connection and chain selection.'
      );
    }
  };

  const handleSendMessage = async (protectedData: string) => {
    try {
      setLoading(true);
      await sendMail(
        'Sandbox mail subject',
        'Sandbox mail content',
        protectedData,
        'text/plain',
        'iExec-sandbox',
        selectedChain
      );
      setLoading(false);
      setemailSentSuccess(true);
    } catch (err) {
      console.log('[sendEmail] ERROR', err);
      setLoading(false);
      setErrorMessage(
        'Failed to send email. Please check your wallet connection and chain selection.'
      );
    }
  };

  return (
    <Box className="my-box">
      {/* Chain Selection */}
      <Box
        sx={{
          marginBottom: '30px',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <Typography
          variant="h6"
          sx={{ marginBottom: '20px', textAlign: 'center' }}
        >
          Chain Selection
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            marginBottom: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedChain}
              onChange={handleChainChange}
              displayEmpty
            >
              {SUPPORTED_CHAINS.map((chain) => (
                <MenuItem key={chain.id} value={chain.id}>
                  {chain.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography
          variant="body2"
          sx={{ marginBottom: '10px', color: '#666' }}
        >
          Selected: {SUPPORTED_CHAINS.find((c) => c.id === selectedChain)?.name}{' '}
          (ID: {selectedChain})
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          <strong>Wallet:</strong> {isConnected ? 'Connected' : 'Disconnected'}
          {address && (
            <>
              <br />
              <strong>Address:</strong> {address.slice(0, 6)}...
              {address.slice(-4)}
            </>
          )}
        </Typography>
      </Box>

      <Button
        sx={{ display: 'block', margin: '30px auto' }}
        onClick={handleLoadAddresses}
        variant="contained"
      >
        Load authorized addresses
      </Button>

      {errorMessage && (
        <Alert severity="error" style={{ maxWidth: 300, margin: 'auto' }}>
          {errorMessage}
        </Alert>
      )}

      {loading && (
        <CircularProgress
          sx={{ display: 'block', margin: '20px auto' }}
        ></CircularProgress>
      )}

      {displayTable && (
        <div>
          <Table
            sx={{
              maxWidth: 200,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            aria-label="simple table"
          >
            <TableHead sx={{ border: 0, borderBottom: 'none' }}>
              <TableRow sx={{ border: 0, borderBottom: 'none' }}>
                <TableCell
                  sx={{
                    border: 0,
                    borderBottom: 'none',
                    fontWeight: 600,
                    minWidth: 335,
                  }}
                >
                  ETH Address
                </TableCell>
                <TableCell
                  sx={{
                    border: 0,
                    borderBottom: 'none',
                    fontWeight: 600,
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentContacts.map((contact, index) => (
                <TableRow key={index} sx={{ border: 0, borderBottom: 'none' }}>
                  <TableCell component="th" scope="row">
                    {contact.address}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      className="ButtonSendM"
                      sx={{}}
                      onClick={() => handleSendMessage(contact.address)}
                      variant="contained"
                    >
                      Send Message
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Box
            sx={{
              maxWidth: 425,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {contacts.length > contactsPerPage && (
              <ul className="pagination">
                {/* Previous button */}
                <Button
                  sx={{ color: 'black' }}
                  className="page-link"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {'<'}
                </Button>

                {/* Page numbers */}
                {getPageNumbers().map((pageNumber, index) => (
                  <Fragment key={index}>
                    <Button
                      sx={{ color: 'black' }}
                      className="page-link"
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  </Fragment>
                ))}

                {/* Next button */}
                <Button
                  sx={{ color: 'black' }}
                  className="page-link"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {'>'}
                </Button>
              </ul>
            )}
          </Box>
        </div>
      )}

      {emailSentSuccess && (
        <Alert
          severity="success"
          style={{ maxWidth: 300, margin: '30px auto' }}
        >
          The email is being sent.
        </Alert>
      )}
    </Box>
  );
}
