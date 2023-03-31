import { Box, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import React, { useState, useEffect } from "react";
import axios from "axios";

const TempTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [ data, setData ] = useState([]);
  const [ columns, setColumns ] = useState([]);
  const [ data1, setData1 ] = useState([]);
  const [ columns1, setColumns1 ] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://bill-be.onrender.com/mssql`, {
          params: {
            query: `
            SELECT 
                CASE WHEN (TRY_CAST([athlete] AS VARCHAR) IS NULL AND [athlete] IS NOT NULL) 
                    THEN '[error] ''' + CAST([athlete] AS NVARCHAR(500)) + ''' is not varchar' 
                    ELSE [athlete] 
                END [athlete],
                CASE WHEN (TRY_CAST([age] AS INT) IS NULL AND [age] IS NOT NULL) 
                    THEN '[error] ''' + CAST([age] AS NVARCHAR(500)) + ''' is not int' 
                    ELSE [age] 
                END [age],
                [country],
                [year],
                CASE 
                    WHEN (CASE WHEN (TRY_CAST([date] AS BIGINT) IS NULL AND [date] IS NOT NULL) 
                        THEN '[error] ''' + CAST([date] AS NVARCHAR(500)) + ''' is not datetime' 
                        ELSE [date] END) LIKE '_error_%' 
                    THEN (CASE WHEN (TRY_CAST([date] AS BIGINT) IS NULL AND [date] IS NOT NULL) 
                        THEN '[error] ''' + CAST([date] AS NVARCHAR(500)) + ''' is not datetime' 
                        ELSE [date] END)
                    ELSE DATEADD(DAY, TRY_CAST([date] AS BIGINT) - 2, '1900-01-01') 
                END [date],
                [sport],
                [gold],
                [silver],
                [bronze],
                [total]
            FROM [dbo].[react_app_temp]
            WHERE [age] LIKE '_error_%' 
                OR [athlete] LIKE '_error_%' 
                OR [date] LIKE '_error_%';
            `,
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

  useEffect(() => {
    const fetchData1 = async () => {
      try {
        const res = await axios.get(`https://bill-be.onrender.com/mssql`, {
          params: {
            query: `
            SELECT 
                CASE
                    WHEN (TRY_CAST([athlete] AS VARCHAR) IS NULL AND [athlete] IS NOT NULL)
                    THEN '[error] ''' + CAST([athlete] AS NVARCHAR(500)) + ''' is not varchar'
                    ELSE [athlete]
                END [athlete],
                CASE
                    WHEN (TRY_CAST([age] AS INT) IS NULL AND [age] IS NOT NULL)
                    THEN '[error] ''' + CAST([age] AS NVARCHAR(500)) + ''' is not int'
                    ELSE [age]
                END [age],
                [country],
                [year],
                CASE 
                    WHEN (CASE WHEN (TRY_CAST([date] AS BIGINT) IS NULL AND [date] IS NOT NULL) 
                        THEN '[error] ''' + CAST([date] AS NVARCHAR(500)) + ''' is not datetime' 
                        ELSE [date] END) LIKE '_error_%' 
                    THEN (CASE WHEN (TRY_CAST([date] AS BIGINT) IS NULL AND [date] IS NOT NULL) 
                        THEN '[error] ''' + CAST([date] AS NVARCHAR(500)) + ''' is not datetime' 
                        ELSE [date] END)
                    ELSE DATEADD(DAY, TRY_CAST([date] AS BIGINT) - 2, '1900-01-01') 
                END [date],
                [sport],
                CASE
                    WHEN (TRY_CAST([gold] AS INT) IS NULL AND [gold] IS NOT NULL)
                    THEN '[error] ''' + CAST([gold] AS NVARCHAR(500)) + ''' is not datetime'
                    ELSE [gold]
                END [gold],
                [silver],
                [bronze],
                [total]
            FROM dbo.react_app_temp
            WHERE [age] NOT LIKE '_error_%' 
                AND [athlete] NOT LIKE '_error_%' 
                AND [date] NOT LIKE '_error_%';
            `,
            token: 123456,
          },
        });
        setData1(res.data.data || []); // add default value
        setColumns1(
          Object.keys(res.data.data[0] || {}).map(item => {
            return { field: item, headerName: item, flex: 1 };
          })
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchData1();
  }, []);
  // const handleTruncate = async () => {
  //   try {
  //     await axios.post(`https://bill-be.onrender.com/insert-mssql`, {
  //       query: `TRUNCATE TABLE dbo.react_app_temp`,
  //       token: 123456,
  //     });
  //     // Gọi lại API để lấy dữ liệu mới nhất
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     handleTruncate();
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);

  const handleUpload = async () => {
    try {
      // Kiểm tra nếu datagrid có dữ liệu thì cảnh báo không cho upload
      if (data.length > 0) {
        alert("Error! Please check data agian");
        return;
      }

      // Upload dữ liệu mới
      await axios.post(`https://bill-be.onrender.com/insert-mssql`, {
        query: `
        INSERT INTO dbo.react_app
        SELECT *
        FROM
        (
            SELECT
                CASE
                    WHEN (TRY_CAST([athlete] AS VARCHAR) IS NULL AND [athlete] IS NOT NULL)
                    THEN '[error] ''' + CAST([athlete] AS NVARCHAR(500)) + ''' is not varchar'
                    ELSE [athlete]
                END [athlete],
                CASE
                    WHEN (TRY_CAST([age] AS INT) IS NULL AND [age] IS NOT NULL)
                    THEN '[error] ''' + CAST([age] AS NVARCHAR(500)) + ''' is not int'
                    ELSE [age]
                END [age],
                [country],
                [year],
              case when (case when (try_cast([date] as bigint) is null and [date] is not null) then '[error] '''+cast([date] as nvarchar(500))+''' is not datetime' else [date] end) like '_error_%' then (case when (try_cast([date] as bigint) is null and [date] is not null) then '[error] '''+cast([date] as nvarchar(500))+''' is not datetime' else [date] end)
            else  dateadd(day,try_cast([date] as bigint)-2,'1900-01-01') end [date],
                [sport],
                CASE
                    WHEN (TRY_CAST([gold] AS INT) IS NULL AND [gold] IS NOT NULL)
                    THEN '[error] ''' + CAST([gold] AS NVARCHAR(500)) + ''' is not datetime'
                    ELSE [gold]
                END [gold],
                [silver],
                [bronze],
                [total],
            [created_date],
            [fileName]
            FROM dbo.react_app_temp
        ) a
        WHERE [age] NOT LIKE '_error_%' AND [athlete] NOT LIKE '_error_%' AND [date] NOT LIKE '_error_%';
        `,
        token: 123456,
      });

      // Lấy dữ liệu mới nhất từ server
      const res = await axios.get(`https://bill-be.onrender.com/mssql`, {
        params: {
          query: `SELECT * FROM dbo.react_app_temp`,
          token: 123456,
        },
      });
      setData(res.data.data || []); // Cập nhật lại state với dữ liệu mới nhất
      alert("Data uploaded successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box m="20px">
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
        <Header title="CORRECT DATA" subtitle="Check correct data" />
        <Box mb={2}>
          <Button variant="contained" color="error" onClick={handleUpload}>
            Upload
          </Button>
        </Box>

        <DataGrid
          rows={data1}
          columns={columns1}
          getRowId={row => {
            let id = "";
            for (const key in row) {
              if (row.hasOwnProperty(key)) {
                id += row[key];
              }
            }
            return id;
          }}
        />
        <Box mt={2}>
          <Header title="ERROR TABLE" subtitle="Check error data" />
        </Box>

        <DataGrid
          rows={data}
          columns={columns}
          getRowId={row => {
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

export default TempTable;
