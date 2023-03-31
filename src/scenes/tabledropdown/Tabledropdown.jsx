import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header";
import { useTheme, Box } from "@mui/material";
import { tokens } from "../../theme";

function Tabledropdown() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [ tables, setTables ] = useState([]);
  const [ selectedTable, setSelectedTable ] = useState(null);
  const [ tableData, setTableData ] = useState([]);
  const [ columns, setColumns ] = useState([]);

  useEffect(() => {
    axios
      .get("https://bill-be.onrender.com/mssql", {
        params: {
          query: "select distinct Table_Name from dbo.config_table",
          token: 123456,
        },
      })
      .then(response => {
        if (response.data.data && response.data.data.length > 0) {
          const tableData = response.data.data;
          const tableNames = tableData.map(record => record.tableName);
          setTables(tableNames);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  useEffect(
    () => {
      if (selectedTable) {
        axios
          .get("https://bill-be.onrender.com/mssql", {
            params: {
              query: `select top 100 * from dbo.config_table where Table_Name = '${selectedTable.value}'`,
              token: 123456,
            },
          })
          .then(response => {
            if (response.data.data && response.data.data.length > 0) {
              const tableData = response.data.data;
              const columns = Object.keys(tableData[0]).map(column => ({
                field: column,
                headerName: column,
                flex: 1,
              }));
              setTableData(tableData);
              setColumns(columns);
            }
          })
          .catch(error => {
            console.error(error);
          });
      }
    },
    [ selectedTable ]
  );

  const handleTableChange = selectedOption => {
    setSelectedTable(selectedOption);
  };

  const tableOptions = tables.map(table => ({
    value: table,
    label: table,
  }));

  return (
    <Box m="20px">
      <Header title="CONFIG" subtitle="CONFIG" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <div>
          <Select
            value={selectedTable}
            onChange={handleTableChange}
            options={tableOptions}
          />
          <div style={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={tableData}
              columns={columns}
              getRowId={row => {
                // Generate a unique ID for each row using a combination of fields
                let id = "";
                for (const key in row) {
                  if (row.hasOwnProperty(key)) {
                    id += row[key];
                  }
                }
                return id;
              }}
              checkboxSelection
              components={{ Toolbar: GridToolbar }}
            />
          </div>
        </div>
      </Box>
    </Box>
  );
}

export default Tabledropdown;
