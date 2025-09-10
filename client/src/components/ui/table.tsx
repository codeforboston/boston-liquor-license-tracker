import React, { ReactNode, useState } from 'react'
import { Table, TableHeader, Column, Row, TableBody, Cell } from 'react-aria-components'


interface StyledRowProps {
  rowData: string[]
}

interface SubRowProps {
  subRowData: string[]
}

interface CustomTableProps {
  tableData: string[][]
}

const StyledRow = ({rowData}: StyledRowProps) => {
  const [subRowsVisible, setSubRowsVisible] = useState<boolean>(false)

  return (
    <>
      <Row
        className="bg-[#F2F2F2] border-b-[1px] border-[#E2E2E2] "
        onAction={() => setSubRowsVisible(prev => !prev)}
      >
        {rowData.map((cell, i) => (
          <Cell
            className={`${i === 0 ? "text-left" : "text-right"} px-[16px] py-[12px] `}
          >
            {cell}
          </Cell>
        ))}  
      </Row>
      {subRowsVisible && (
        <>
          <SubRow subRowData={rowData}/>
          <SubRow subRowData={rowData}/>
        </>
      )}
    </>
    
  )
}

const SubRow = ({subRowData}: SubRowProps) => {
  return (
    <Row className='bg-[#FDFDFD] border-b-[1px] border-[#E2E2E2]'>
      {subRowData.map((cell, i) => (
        <Cell
          className={`${i === 0 ? "text-left" : "text-right"} px-[16px] pl-[48px] py-[12px] `}
        >
          {i === 0 ? "Beer/Wine Licenses" : cell}
        </Cell>
      ))}
    </Row>
  )
}

const CustomTable = ({tableData}: CustomTableProps) => {
  return (
    <Table className={"w-[1400px]"}>
      <TableHeader className=" bg-[#2E2E2E] text-[#FDFDFD]">
        <Column className="w-1/3 px-[16px] py-[12px] text-left " isRowHeader>Zipcode:</Column>
        <Column className="px-[16px] py-[12px]" isRowHeader>Licenses Available:</Column>
        <Column className="px-[16px] py-[12px]" isRowHeader>Recent Applicants:</Column>
        <Column className="px-[16px] py-[12px]" isRowHeader>Licenses Granted:</Column>
        <Column className="px-[16px] py-[12px]" isRowHeader>Total Licenses:</Column>
      </TableHeader>
      <TableBody>
        {tableData.map(row => (
          <StyledRow rowData={row}/>
        ))}
      </TableBody>
    </Table>
  )
}

export default CustomTable
