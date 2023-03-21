import { Box } from "@mui/material";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { tokens } from "../../theme";
import React, { useState } from "react";
// import { mockDataContacts } from "../../data/mockData";
// import Header from "../../components/Header";
// import { useTheme } from "@mui/material";
import axios from "axios";
import { Component } from "react";
// import { render } from "preact/compat";

// const Contact = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const [ data, setData ] = useState([]);

//   componentDidMount = async () => {
//     await axios.get(`https://bill-be.onrender.com/mssql`).then(res => {
//       setData(res.data);
//     });
//     console.log(data);
//   };

//   return (
//     <Box m="20px">
//       <Header
//         title="CONTACTS"
//         subtitle="List of Contacts for Future Reference"
//       />
//       <Box
//         m="40px 0 0 0"
//         height="75vh"
//         sx={{
//           "& .MuiDataGrid-root": {
//             border: "none",
//           },
//           "& .MuiDataGrid-cell": {
//             borderBottom: "none",
//           },
//           "& .name-column--cell": {
//             color: colors.greenAccent[300],
//           },
//           "& .MuiDataGrid-columnHeaders": {
//             backgroundColor: colors.blueAccent[700],
//             borderBottom: "none",
//           },
//           "& .MuiDataGrid-virtualScroller": {
//             backgroundColor: colors.primary[400],
//           },
//           "& .MuiDataGrid-footerContainer": {
//             borderTop: "none",
//             backgroundColor: colors.blueAccent[700],
//           },
//           "& .MuiCheckbox-root": {
//             color: `${colors.greenAccent[200]} !important`,
//           },
//           "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
//             color: `${colors.grey[100]} !important`,
//           },
//         }}
//       >
//         {/* <DataGrid
//           rows={mockDataContacts}
//           columns={columns}
//           components={{ Toolbar: GridToolbar }}
//         /> */}
//       </Box>
//     </Box>
//   );
// };

class Contacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }
  async componentDidMount() {
    await axios
      .get(`https://bill-be.onrender.com/mssql`, {
        params: {
          query: "select top 100 * from dbo.react_app",
          token: 123456,
        },
      })
      .then(res => {
        this.setState({ data: res.data });
      });
    console.log(this.state.data);
  }
  render() {
    return <Box />;
  }
}
export default Contacts;
