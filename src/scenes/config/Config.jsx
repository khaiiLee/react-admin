import { Box, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import React, { useState, useEffect } from "react";
import axios from "axios";

const Config = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [ data, setData ] = useState([]);
  const [ columns, setColumns ] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://bill-be.onrender.com/mssql`, {
          params: {
            query: "select top 100 * from dbo.master",
            token: 123456,
          },
        });
        setData(res.data.data || []); // add default value
        setColumns(
          Object.keys(res.data.data[0] || {}).map(item => {
            return { field: item, headerName: item, flex: 1 };
          })
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <Box m="20px">
      <Header title="Config" subtitle="Config Master Table" />
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
        }}
      >
        <DataGrid
          rows={data}
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
        />
      </Box>
    </Box>
  );
};
export default Config;
