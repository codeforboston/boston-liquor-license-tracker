import { ChangeEvent, useState } from 'react'
import { ExpandMore } from '@mui/icons-material';

interface LicenseFilterDropdownProps {
  options: string[]
  placeholderOption?: string
}


const LicenseFilterDropdown = ({ options, placeholderOption }: LicenseFilterDropdownProps) => {
  const [selected, setSelected] = useState<string>(placeholderOption ? "" : options[0])

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value)
  }

  return (
    <div
      className={`filter-container relative inline-flex h-[40px] w-[160px] px-[16px] py-[8px] rounded-[8px] bg-ui`}
    >
      <select
        name="license-dropdown-filter"
        id="license-dropdown-filter"
        value={selected}
        className={`appearance-none bg-ui w-full text-[14px]`}
        onChange={handleSelect}
      >
        {placeholderOption &&
          <option disabled hidden value={""}>
            {placeholderOption}
          </option>
        }
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span className='icon-container absolute right-[16px] pointer-events-none pl-[8px] border-l-[.5px] border-dark'>
        <ExpandMore id="expand-more" className='text-dark' style={{ fontSize: 24 }} />
      </span>
    </div>
  )
}

export default LicenseFilterDropdown
