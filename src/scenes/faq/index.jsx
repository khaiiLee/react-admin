// import { Box } from "@mui/material";
// import Header from "../../components/Header";
// import React, { useState } from "react";
// import MaterialTable from "@material-table/core";
// import * as XLSX from "xlsx";
// import axios from "axios";

// const EXTENSIONS = [ "xlsx", "xls", "csv" ];

// const ImportFile = () => {
//   const [ colDefs, setColDefs ] = useState();
//   const [ data, setData ] = useState();

//   const getExention = file => {
//     const parts = file.name.split(".");
//     const extension = parts[parts.length - 1];
//     return EXTENSIONS.includes(extension); // return boolean
//   };

//   const convertToJson = (headers, data) => {
//     const rows = [];
//     data.forEach(row => {
//       let rowData = {};
//       row.forEach((element, index) => {
//         rowData[headers[index]] = element;
//       });
//       rows.push(rowData);
//     });
//     return rows;
//   };

//   const importExcel = e => {
//     const file = e.target.files[0];
//     const reader = new FileReader();
//     reader.onload = event => {
//       //parse data
//       const bstr = event.target.result;
//       const workBook = XLSX.read(bstr, { type: "binary" });

//       //get first sheet
//       const workSheetName = workBook.SheetNames[0];
//       const workSheet = workBook.Sheets[workSheetName];
//       //convert to array
//       const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
//       const headers = fileData[0];
//       const heads = headers.map(head => ({ title: head, field: head }));
//       setColDefs(heads);

//       //removing header
//       fileData.splice(0, 1);

//       setData(convertToJson(headers, fileData));

//       // Push data to server
//       axios
//         .post("https://bill-be.onrender.com/insert-mssql", {
//           query:
//             "INSERT INTO dbo.uit" +
//             "(" +
//             Object.keys(data[0]) +
//             ")" +
//             "VALUES" +
//             "('" +
//             Object.values(data[0]).join("','") +
//             "')",
//           token: 123456,
//         })
//         .then(response => {
//           console.log(response.data);
//         })
//         .catch(error => {
//           console.log(error);
//         });
//     };

//     if (file) {
//       if (getExention(file)) {
//         reader.readAsBinaryString(file);
//       } else {
//         alert("Invalid file input, Select Excel, CSV file");
//       }
//     } else {
//       setData([]);
//       setColDefs([]);
//     }
//   };

//   return (
//     <Box m="20px">
//       <Header title="IMPORT" subtitle="Import XLSX or CSV" />
//       <Box>
//         <div className="App">
//           <input type="file" onChange={importExcel} />
//           <MaterialTable title="Import Table" data={data} columns={colDefs} />
//         </div>
//       </Box>
//     </Box>
//   );
// };

// export default ImportFile;

import { Box } from "@mui/material";
import Header from "../../components/Header";
import React, { useState } from "react";
import MaterialTable from "@material-table/core";
import * as XLSX from "xlsx";
import axios from "axios";

const EXTENSIONS = [ "xlsx", "xls", "csv" ];

const ImportFile = () => {
  const [ colDefs, setColDefs ] = useState([]);
  const [ data, setData ] = useState([]);

  const getExtension = file => {
    const parts = file.name.split(".");
    const extension = parts[parts.length - 1];
    return EXTENSIONS.includes(extension);
  };

  const convertToJson = (headers, data) => {
    const rows = [];
    data.forEach(row => {
      let rowData = {};
      row.forEach((element, index) => {
        rowData[headers[index]] = element;
      });
      rows.push(rowData);
    });
    return rows;
  };

  const importExcel = async e => {
    const file = e.target.files[0];
    if (file && getExtension(file)) {
      const reader = new FileReader();
      reader.onload = async event => {
        //parse data
        const bstr = event.target.result;
        const workBook = XLSX.read(bstr, { type: "binary" });

        //get first sheet
        const workSheetName = workBook.SheetNames[0];
        const workSheet = workBook.Sheets[workSheetName];
        //convert to array
        const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
        const headers = fileData[0];
        const heads = headers.map(head => ({ title: head, field: head }));
        console.log(heads);
        console.log(fileData);
        setColDefs(heads);

        //removing header
        fileData.splice(0, 1);

        const jsonData = convertToJson(headers, fileData);
        setData(jsonData);
        // Push data to server
        try {
          const columns = Object.keys(jsonData[0]);
          const values = jsonData
            .map(item => Object.values(item).join("','"))
            .join("'),('");
          const query = `INSERT INTO dbo.uit (${columns}) VALUES ('${values}')`;
          const response = await axios.post(
            "https://bill-be.onrender.com/insert-mssql",
            { query, token: 123456 }
          );
          console.log(response.data);
        } catch (error) {
          console.log(error);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setData();
      setColDefs();
      alert("Invalid file input. Please select an Excel, CSV file");
    }
  };

  return (
    <Box m="20px">
      <Header title="IMPORT" subtitle="Import XLSX or CSV" />
      <Box>
        <div className="App">
          <input type="file" onChange={importExcel} />
          <MaterialTable title="Import Table" data={data} columns={colDefs} />
        </div>
      </Box>
    </Box>
  );
};

export default ImportFile;
