import { ChangeEvent, useState } from 'react'
import { ExpandMore } from '@mui/icons-material';


interface DropdownOptionProps {
  option: string
  isPlaceholder?: boolean
}

interface LicenseFilterDropdownProps {
  options: string[]
  placeholderOption?: string 
}


const DropdownOption = ({option, isPlaceholder=false}: DropdownOptionProps) => {
  return (
    <option 
      disabled={isPlaceholder}
      hidden={isPlaceholder}
      value={isPlaceholder ? "" : option}
    >
      {option}
    </option>
  )
}

const LicenseFilterDropdown = ({options, placeholderOption}: LicenseFilterDropdownProps) => {
  const [selected, setSelected] = useState<string>(placeholderOption ? "" : options[0])
  const fullOptions = placeholderOption ? [placeholderOption, ...options] : options
  
  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value)
  }

  console.log(selected)
  return (
    <div 
      className={`filter-container relative inline-flex h-[40px] w-[160px] px-[16px] py-[8px] rounded-[8px] bg-[#F2F2F2]`}
    >
      <select
        name="license-dropdown-filter" 
        id="license-dropdown-filter"
        value={selected}
        className={`appearance-none bg-[#F2F2F2] w-full text-[14px]`}
        onChange={handleSelect}
      >
        {fullOptions.map((opt, idx) =>  (
          <DropdownOption 
            key={idx} 
            option={opt} 
            isPlaceholder={idx === 0 && !!placeholderOption}
          />
        ))}
      </select>
      <span className='icon-container absolute right-[16px] pointer-events-none pl-[8px] border-l-[.5px] border-[#2e2e2e]'>
          <ExpandMore id="expand-more" style={{ fontSize: 24, color: '#2e2e2e' }}/>
      </span>
    </div>
  )
}

export default LicenseFilterDropdown
