import { Contact } from "@iexec/web3mail";
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme
} from "@mui/material";
import { Fragment, useState } from "react";
import { useAccount, useDisconnect } from 'wagmi';
import "./styles.css";
import Connect from './wallet/connect';
import { fetchMyContacts } from "./web3mail/web3mail";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FCD15A",
      contrastText: "#1D1D24",
    },
  },
});

export default function App() {

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [loading, setLoading] = useState(false);
  const [displayTable, setdisplayTable] = useState(false);
  const [emailSentSuccess, setemailSentSuccess] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 5; // Number of contacts to display per page
  const pageLimit = 3;

  // Calculate the indexes of the contacts to display on the current page
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);

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

  const handleLoadAddresses = async () => {
    setLoading(true);
    const res = await fetchMyContacts();
    setContacts(res);
    setLoading(false);
    setdisplayTable(true);
  };
  const handleSendMessage = async () => {
    setLoading(true);
    await new Promise((f) => setTimeout(f, 2000));
    setLoading(false);
    setemailSentSuccess(true);
  };
  
  //wallet address shortening
  const shortAddress = (address: string) => {
    return address.slice(0, 6) + '...' + address.slice(-4);
  };
  
  return (
    <ThemeProvider theme={theme}>
      {isConnected ? (
        <>
          {/**App bar for wallet connection*/}
          <AppBar
            position="static"
            elevation={0}
            sx={{ backgroundColor: 'transparent', width: '100%' }}
          >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Typography
                sx={{
                  flexGrow: 1,
                  textAlign: 'right',
                  mr: 2,
                  fontStyle: 'italic',
                }}
              >
                {shortAddress(address as string)}
              </Typography>
              <Button variant="contained" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </Toolbar>
          </AppBar>

      <Box className="my-box">
        <Button
          sx={{ display: "block", margin: "20px auto" }}
          onClick={handleLoadAddresses}
          variant="contained"
        >
          Load authorized addresses
        </Button>
        {loading && (
          <CircularProgress
            sx={{ display: "block", margin: "20px auto" }}
          ></CircularProgress>
        )}

            {displayTable && (
              <div>
                <Table sx={{ maxWidth: 200, marginLeft: 'auto', marginRight: 'auto' }} aria-label="simple table">
                  <TableHead sx={{ border: 0, borderBottom: 'none' }}>
                    <TableRow sx={{ border: 0, borderBottom: 'none' }}>
                      <TableCell sx={{ border: 0, borderBottom: 'none', fontWeight: 600 }}>ETH Address</TableCell>
                      <TableCell sx={{ border: 0, borderBottom: 'none', fontWeight: 600 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentContacts.map((contact, index) => (
                      <TableRow key={index} sx={{ border: 0, borderBottom: 'none' }}>
                        <TableCell component="th" scope="row">
                          {shortAddress(contact.address)}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            className="ButtonSendM"
                            sx={{}}
                            onClick={() => handleSendMessage()}
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
                <Box sx={{ maxWidth: 550, marginLeft: 'auto', marginRight: 'auto' }}>
                  <div>
      {contacts.length > contactsPerPage && (
        <ul className="pagination">
          {/* Previous button */}
            <Button className="page-link" onClick={() => paginate(currentPage - 1)}>
              Previous
            </Button>
          

          {/* Page numbers */}
          {getPageNumbers().map((pageNumber, index) => (
            <Fragment key={index}>
              {index === 0 && currentPage > Math.floor(pageLimit / 2) && (
               <Button >...</Button>
              )}

            
                <Button className="page-link" onClick={() => paginate(pageNumber)}>
                  {pageNumber}
                </Button>
              

              {index === getPageNumbers().length - 1 && pageNumber < totalPages - Math.floor(pageLimit / 2) && (
                 <Button >...</Button>
              )}
            </Fragment>
          ))}

          {/* Next button */}
            <Button className="page-link" onClick={() => paginate(currentPage + 1)}>
              Next
            </Button>
        </ul>
      )}
    </div>
                </Box>
              </div>
            )}
        
        {emailSentSuccess && (
          <Alert sx={{ mt: 3, mb: 2 }} severity="success">
            An email has been sent to the user{" "}
          </Alert>
        )}
          </Box>
          </>
          ) : (
        <Connect />
      )}
    </ThemeProvider>
  );
}
