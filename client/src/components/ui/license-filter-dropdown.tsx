import { ChangeEvent, useState } from 'react'
import {Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue, ListBoxItemProps, Selection, Checkbox, MenuTrigger, Menu, MenuTriggerProps, MenuItem, MenuProps} from 'react-aria-components';
import { ExpandMore, ExpandLess, Check, CheckBox, CheckBoxOutlined, CheckBoxOutlineBlank } from '@mui/icons-material';
import { MenuItemProps } from '@mui/material/MenuItem';

interface DropdownOption { 
  id: number
  name: string
}
interface LicenseFilterDropdownProps {
  title: string
  options: DropdownOption[]
  // placeholderOption?: string
}



const DropdownOption = (props: MenuItemProps & {option: DropdownOption}) => {
  const {id, option} = props
  return (
    <MenuItem 
      id={id}
      textValue={option.name}
      className={"flex items-center bg-[#F2F2F2]"}
    >
      
      {({isSelected}) => (
        <>
          <p className='flex-1'>{option.name}</p>
          {isSelected ? 
            <CheckBox style={{height: "13.5px", width: "13.5px"}}/> :
            <CheckBoxOutlineBlank style={{height: "13.5px", width: "13.5px"}}/> 
          }
        </>
      )}
    </MenuItem>
  )
}


const LicenseFilterDropdown = ({ title, options }: LicenseFilterDropdownProps) => {
  const [selected, setSelected] = useState<Selection>(new Set())

  return (

    <MenuTrigger >
      <Button
        aria-label='Licenst Filter Selection'
        className="flex items-center gap-x-2 px-[16px] py-[8px] bg-[#F2F2F2] rounded-[8px] focus:outline-hidden focus-visible:ring-2 cursor-default " 
      >
        {title}
        <span aria-hidden="true" className='border-l-[.5px] border-[#2e2e2e]'>
          <ExpandMore id="expand-more" style={{ fontSize: 24, color: '#2e2e2e' }} />
        </span>
      </Button>
      <Popover 
        className="m-0 p-0 w-[var(--trigger-width)]"
      >
        <Menu 
          selectionMode='multiple'
          selectedKeys={selected}
          onSelectionChange={(keys) => setSelected(new Set(keys as Set<string>))}
        >
          {options.map(opt => (
              <DropdownOption option={opt} key={opt.id}/>
            ))}
        </Menu>
      </Popover>
    </MenuTrigger>
      // <MenuTrigger>
      //   <Button 
      //     onPress={() => setDropdownOpen(prev => !prev)}
      //     className="flex items-center gap-x-2 px-[16px] py-[8px] bg-[#F2F2F2] rounded-[8px] focus:outline-hidden focus-visible:ring-2 cursor-default "
      //   >
      //     <p>Example Text</p>
      //     <span aria-hidden="true" className='border-l-[.5px] border-[#2e2e2e]'>
      //       <ExpandMore id="expand-more" style={{ fontSize: 24, color: '#2e2e2e' }} />
      //     </span>
      //   </Button>

      //   <Popover className=" w-(--trigger-width) bg-[#F2F2F2] rounded-b-[8px] overflow-auto entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
      //     <Menu 
      //       aria-label='License filter options'
      //       selectionMode='multiple'
      //       selectedKeys={selected}
      //       onSelectionChange={(keys) => setSelected(new Set(keys as Set<string>))}
      //       className="outline-hidden"
      //     >
      //       {options.map(opt => (
      //         <DropdownOption option={opt} key={opt.id}/>
      //       ))}
      //     </Menu>
      //   </Popover>

      // </MenuTrigger>

  )

}

export default LicenseFilterDropdown
