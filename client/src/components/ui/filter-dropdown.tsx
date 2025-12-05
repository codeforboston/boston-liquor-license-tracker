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
      className={"flex items-center px-[16px] pb-[8px] outline-none hover:bg-font-links-hover"}
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

        <MenuTrigger onOpenChange={setMenuOpen}>
          <Button
            aria-label={label}
            className={`inline-flex items-center bg-clip-padding gap-x-2 px-[16px] py-[8px] bg-ui-gray ${menuOpen ? "rounded-t-[8px]" : "rounded-[8px]" } cursor-default outline-none `}
          >

            <p>{title}</p>
            <span className='bg-background-dark w-[.5px] h-[24px]'/>
            <span aria-hidden="true">
              {menuOpen ? 
                <ExpandLess style={{ fontSize: 24, color: 'var(--color-font-dark)' }} />
              :
                <ExpandMore style={{ fontSize: 24, color: 'var(--color-font-dark)' }} />
              }
              
            </span>
          </Button>
          <Popover 
            placement='bottom start'
            offset={0}
            containerPadding={0}
            shouldFlip={false}
            className="w-[var(--trigger-width)] bg-ui-gray rounded-b-[8px] outline-none "
          >
            <Menu 
              selectionMode='multiple'
              selectedKeys={selected}
              onSelectionChange={(keys) => setSelected(new Set(keys as Set<string>))}
              className="w-full outline-none "
            >
              {options.map(opt => (
                  <DropdownOption option={opt} key={opt.id}/>
                ))}
            </Menu>
          </Popover>
        </MenuTrigger>

  )

}

export default FilterDropdown
