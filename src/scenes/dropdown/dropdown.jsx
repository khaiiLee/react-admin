import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";

function Tabledropdown() {
  const [ tables, setTables ] = useState([]);
  const [ selectedTable, setSelectedTable ] = useState(null);
  const [ tableData, setTableData ] = useState([]);

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
              query: `select top 100 * from ${selectedTable.value}`,
              token: 123456,
            },
          })
          .then(response => {
            if (response.data.data && response.data.data.length > 0) {
              setTableData(response.data.data);
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
  console.log(tableOptions); // In giá trị của tableOptions ra để kiểm tra

  return (
    <div>
      <Select
        value={selectedTable}
        onChange={handleTableChange}
        options={tableOptions}
      />
      <table>
        <thead>
          <tr>
            {tableData.length > 0 &&
              Object.keys(tableData[0]).map(key => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tabledropdown;
