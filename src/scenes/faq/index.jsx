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
    const fileName = file.name; // lấy tên file
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
        console.log(fileName);
        setColDefs(heads);

        //removing header
        fileData.splice(0, 1);

        const jsonData = convertToJson(headers, fileData);
        setData(jsonData);
        // Push data to server
        try {
          const columns = Object.keys(jsonData[0]).concat(
            "created_date"
            // "fileName"
          ); // thêm tên cột modifiedOn vào danh sách các cột
          const values = jsonData
            .map(item =>
              Object.values(item)
                .map(value => `'${value}'`)
                // .concat("CURRENT_TIMESTAMP", "'" + fileName + "'")`
                .concat("CURRENT_TIMESTAMP")
                .join(",")
            )
            .join("),(");
          const query = `INSERT INTO dbo.react_app (${columns.join(
            ","
          )}) VALUES (${values})`;
          const response = await axios.post(
            "https://bill-be.onrender.com/insert-mssql",
            { query, token: 123456 }
          );
          console.log(query);
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
