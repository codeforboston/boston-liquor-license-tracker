
const LicenseFilterDropdown = () => {
  return (
    <div 
      className="inline-flex h-[40px] w-[160px] px-[16px] py-[8px] rounded-[8px] bg-[#F2F2F2] ">
      <select
        name="license-dropdown-filter" 
        id="license-dropdown-filter"
        className="border-none w-full"
      >
        <option disabled selected hidden>Select an Option</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
        <option value="4">Option 4</option>
      </select>
    </div>
  )
}

export default LicenseFilterDropdown
