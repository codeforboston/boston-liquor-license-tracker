import { useState } from 'react'
import {Button, Popover, Selection, MenuTrigger, Menu, MenuItem} from 'react-aria-components';
import { ExpandMore, ExpandLess, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { MenuItemProps } from '@mui/material/MenuItem';

interface DropdownOption { 
  id: number
  name: string
}
interface FilterDropdownProps {
  title: string
  label: string
  options: DropdownOption[]
}



const DropdownOption = (props: MenuItemProps & {option: DropdownOption}) => {
  const {id, option} = props
  return (
    <MenuItem 
      id={id}
      textValue={option.name}
      className={"flex items-center px-[16px] pb-[8px]"}
    >
      
      {({isSelected}) => (
        <>
          <p className='flex-1'>{option.name}</p>
          {isSelected ? 
            <CheckBox style={{height: "18px", width: "18px"}}/> :
            <CheckBoxOutlineBlank style={{height: "18px", width: "18px"}}/> 
          }
        </>
      )}
    </MenuItem>
  )
}


const FilterDropdown = ({ title, label, options,  }: FilterDropdownProps) => {
  const [selected, setSelected] = useState<Selection>(new Set())
  const [menuOpen, setMenuOpen] = useState<boolean>(false)

  return (
      // for some reason I can't figure out--needs to have padding wrapper in order to properly align the popover menu below the button/trigger
      <div className='p-4'> 

        <MenuTrigger onOpenChange={setMenuOpen}>
          <Button
            aria-label={label}
            className={`inline-flex items-center bg-clip-padding gap-x-2 px-[16px] py-[8px] bg-[#F2F2F2] ${menuOpen ? "rounded-t-[8px]" : "rounded-[8px]" } cursor-default `}
          >

            <p>{title}</p>
            <span className='bg-[#2e2e2e] w-[.5px] h-[24px]'/>
            <span aria-hidden="true">
              {menuOpen ? 
                <ExpandLess id="expand-more" style={{ fontSize: 24, color: '#2e2e2e' }} />
              :
                <ExpandMore id="expand-more" style={{ fontSize: 24, color: '#2e2e2e' }} />
              }
              
            </span>
          </Button>
          <Popover 
            placement='bottom start'
            offset={0}
            shouldFlip={false}
            className="m-0 p-0 w-[var(--trigger-width)] bg-[#F2F2F2] rounded-b-[8px] outline-hidden"
          >
            <Menu 
              selectionMode='multiple'
              selectedKeys={selected}
              onSelectionChange={(keys) => setSelected(new Set(keys as Set<string>))}
              className="w-full"
            >
              {options.map(opt => (
                  <DropdownOption option={opt} key={opt.id}/>
                ))}
            </Menu>
          </Popover>
        </MenuTrigger>
      </div>

  )

}

export default FilterDropdown
