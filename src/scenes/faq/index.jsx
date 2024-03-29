import { Box, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import Select from "react-select";

const EXTENSIONS = [ "xlsx", "xls", "csv" ];

const ImportFile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [ data, setData ] = useState([]);
  const [ columns, setColumns ] = useState([]);
  const [ data1, setData1 ] = useState([]);
  const [ columns1, setColumns1 ] = useState([]);
  const [ showTable, setShowTable ] = useState(true);
  const [ tables, setTables ] = useState([]);
  const [ selectedTable, setSelectedTable ] = useState(null);

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
          const tableNames = tableData.map(record => record.Table_Name); // Thay đổi tên trường thành Table_Name
          setTables(tableNames);
          console.log(response.data.data);
          console.log(tableNames);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, []);
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
        // setColumns(heads);

        //removing header
        fileData.splice(0, 1);

        const jsonData = convertToJson(headers, fileData);
        // setData(jsonData);
        // Push data to server

        try {
          const columns = Object.keys(jsonData[0]).concat(
            "fileName",
            "created_date",
            "updated_date"
          ); // thêm tên cột modifiedOn vào danh sách các cột
          const values = jsonData
            .map(item =>
              Object.values(item)
                .map(value => `'${value}'`)
                .concat(
                  "'" + fileName + "'",
                  "CURRENT_TIMESTAMP",
                  "CURRENT_TIMESTAMP"
                )
                .join(",")
            )
            .join("),(");
          const query = `
          TRUNCATE TABLE ${selectedTable["value"]}_temp
          INSERT INTO ${selectedTable["value"]}_temp (${columns.join(
            ","
          )}) VALUES (${values})`;
          const response = await axios.post(
            "https://bill-be.onrender.com/insert-mssql",
            { query, token: 123456 }
          );
          console.log(query);
          console.log(response.data);
          getErrorData();
          getSuccessData();
          // window.location.reload();
        } catch (error) {
          console.log(error);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setData();
      setColumns();
      setColumns1();
      alert("Invalid file input. Please select an Excel, CSV file");
    }
  };
  let getErrorData = async () => {
    let query = `
    SELECT *
    FROM
    (
        SELECT
            CASE
                WHEN (TRY_CAST([id] AS VARCHAR) IS NULL AND [id] IS NOT NULL)
                THEN '[error] ''' + CAST([id] AS NVARCHAR(500)) + ''' is not varchar'
                ELSE [id]
            END [id],
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
    case when (case when (try_cast([date] as bigint) is null and [date] is not null) then '[error] '''+cast([date] as nvarchar(500))+''' is not datetime' else [date] end) like '_error_%' then (case when (try_cast([date] as bigint) is null and [date] is not null) then '[error] '''+cast([date] as nvarchar(500))+''' is not datetime' else [date] end)
        else  dateadd(day,try_cast([date] as bigint)-2,'1900-01-01') end [date],
            [year],
            [sport],
            CASE
                WHEN (TRY_CAST([gold] AS INT) IS NULL AND [gold] IS NOT NULL)
                THEN '[error] ''' + CAST([gold] AS NVARCHAR(500)) + ''' is not datetime'
                ELSE [gold]
            END [gold],
            [silver],
            [bronze],
            [total],
        [fileName],
  [created_date],
  [updated_date] from
  ${selectedTable["value"]}_temp
    ) a
    WHERE [age] LIKE '_error_%' AND [athlete] LIKE '_error_%' AND [date] LIKE '_error_%';
        `;
    const res = await axios.get(`https://bill-be.onrender.com/mssql`, {
      params: {
        query: query,
        token: 123456,
      },
    });
    console.log(query);
    console.log(res.data.data);
    setData(res.data.data || []); // add default value
    setColumns(
      Object.keys(res.data.data[0] || {}).map(item => {
        return { field: item, headerName: item, flex: 1 };
      })
    );
  };
  let getSuccessData = async () => {
    try {
      const res = await axios.get(`https://bill-be.onrender.com/mssql`, {
        params: {
          query: `
          SELECT *
          FROM
          (
              SELECT
                  CASE
                      WHEN (TRY_CAST([id] AS VARCHAR) IS NULL AND [id] IS NOT NULL)
                      THEN '[error] ''' + CAST([id] AS NVARCHAR(500)) + ''' is not varchar'
                      ELSE [id]
                  END [id],
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
          case when (case when (try_cast([date] as bigint) is null and [date] is not null) then '[error] '''+cast([date] as nvarchar(500))+''' is not datetime' else [date] end) like '_error_%' then (case when (try_cast([date] as bigint) is null and [date] is not null) then '[error] '''+cast([date] as nvarchar(500))+''' is not datetime' else [date] end)
              else  dateadd(day,try_cast([date] as bigint)-2,'1900-01-01') end [date],
                  [year],
                  [sport],
                  CASE
                      WHEN (TRY_CAST([gold] AS INT) IS NULL AND [gold] IS NOT NULL)
                      THEN '[error] ''' + CAST([gold] AS NVARCHAR(500)) + ''' is not datetime'
                      ELSE [gold]
                  END [gold],
                  [silver],
                  [bronze],
                  [total],
              [fileName],
        [created_date],
        [updated_date] from
        ${selectedTable["value"]}_temp
          ) a
          WHERE [age] NOT LIKE '_error_%' AND [athlete] NOT LIKE '_error_%' AND [date] NOT LIKE '_error_%';
        `,
          token: 123456,
        },
      });
      setData1(res.data.data || []); // add default value
      console.log(res.data.data);
      setColumns1(
        Object.keys(res.data.data[0] || {}).map(item => {
          return { field: item, headerName: item, flex: 1 };
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async () => {
    try {
      // Kiểm tra nếu datagrid có dữ liệu thì cảnh báo không cho upload
      if (data.length > 0) {
        alert("Error! Please check data agian");
        return;
      }
      setShowTable(false); // Ẩn bảng
      // Upload dữ liệu mới
      await axios.post(`https://bill-be.onrender.com/insert-mssql`, {
        query: `
        INSERT INTO ${selectedTable["value"]}
        SELECT *
        FROM
        (
            SELECT
                CASE
                    WHEN (TRY_CAST([id] AS VARCHAR) IS NULL AND [id] IS NOT NULL)
                    THEN '[error] ''' + CAST([id] AS NVARCHAR(500)) + ''' is not varchar'
                    ELSE [id]
                END [id],
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
				case when (case when (try_cast([date] as bigint) is null and [date] is not null) then '[error] '''+cast([date] as nvarchar(500))+''' is not datetime' else [date] end) like '_error_%' then (case when (try_cast([date] as bigint) is null and [date] is not null) then '[error] '''+cast([date] as nvarchar(500))+''' is not datetime' else [date] end)
            else  dateadd(day,try_cast([date] as bigint)-2,'1900-01-01') end [date],
                [year],
                [sport],
                CASE
                    WHEN (TRY_CAST([gold] AS INT) IS NULL AND [gold] IS NOT NULL)
                    THEN '[error] ''' + CAST([gold] AS NVARCHAR(500)) + ''' is not datetime'
                    ELSE [gold]
                END [gold],
                [silver],
                [bronze],
                [total],
            [fileName],
			[created_date],
			[updated_date] from
      ${selectedTable["value"]}_temp
        ) a
        WHERE [age] NOT LIKE '_error_%' AND [athlete] NOT LIKE '_error_%' AND [date] NOT LIKE '_error_%';
        `,
        token: 123456,
      });

      // Lấy dữ liệu mới nhất từ server
      const res = await axios.get(`https://bill-be.onrender.com/mssql`, {
        params: {
          query: `SELECT * FROM ${selectedTable["value"]}_temp`,
          token: 123456,
        },
      });
      setData(res.data.data || []); // Cập nhật lại state với dữ liệu mới nhất
      alert("Data uploaded successfully!");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };
  const handleTableChange = selectedOption => {
    console.log(selectedOption);
    setSelectedTable(selectedOption);
  };

  const tableOptions = tables.map(table => ({
    value: table,
    label: table,
  }));
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: "black",
    }),
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
        <Header title="IMPORT" subtitle="Import XLSX or CSV" />
        <Box mt={2} mb={2}>
          <Select
            value={selectedTable}
            onChange={handleTableChange}
            options={tableOptions}
            styles={customStyles}
          />
        </Box>
        <input type="file" onChange={importExcel} />
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
        <Box mt={2} mb={2} marginLeft={140}>
          <Button variant="contained" color="warning" onClick={handleUpload}>
            SUBMIT
          </Button>
        </Box>
        {showTable &&
        data.length > 0 && (
          <Box mt={2}>
            <Header title="ERROR TABLE" subtitle="Check error data" />
          </Box>
        )}
        {showTable &&
        data.length > 0 && (
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
        )}
      </Box>
    </Box>
  );
};

export default ImportFile;
