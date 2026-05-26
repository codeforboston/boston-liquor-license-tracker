import FilterDropdown from "@/components/ui/filter-dropdown";
import {
  eligibleBostonZipcodes,
} from "@/services/data-interface/data-interface";
import { EligibleBostonZipcode } from "@/services/data-interface/data-interface";
import { Selection } from "react-aria-components";
import { useCallback, useEffect, useMemo, useState } from "react";


interface ZipCodeFilterProps {
  setZipcodeList: (zipCodes: Set<EligibleBostonZipcode>) => void
  initialZip?: EligibleBostonZipcode
}


const ZipCodeFilter = ({ setZipcodeList, initialZip }: ZipCodeFilterProps) => {
  const [selectedDropdownOptions, setSelectedDropdownOptions] =
    useState<Selection>(new Set());

  const dropdownZipOptions = useMemo(
    () =>
      [...eligibleBostonZipcodes].map((zip, index) => ({
        id: `react-aria-${index + 1}`,
        name: String(zip),
      })),
    []
  );

  useEffect(() => {
    if (initialZip) {
      const option = dropdownZipOptions.find((o) => o.name === initialZip);
      if (option) {
        setSelectedDropdownOptions(new Set([option.id]));
        setZipcodeList(new Set([initialZip]));
      }
    } else {
      setZipcodeList(eligibleBostonZipcodes);
    }
  }, [initialZip, setZipcodeList, dropdownZipOptions]);

  const onZipSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedDropdownOptions(new Set(keys as Set<string>));

      const selectedOptions = dropdownZipOptions.filter((option) =>
        (keys as Set<string>).has(option.id.toString())
      );

      const zipcodes = selectedOptions.map(
        (option) => option.name as EligibleBostonZipcode
      );

      if (zipcodes.length) {
        setZipcodeList(new Set(zipcodes));
      } else {
        setZipcodeList(eligibleBostonZipcodes);
      }
    },
    [dropdownZipOptions, setZipcodeList]
  );
  
  return (
    <FilterDropdown
        titleId="database.availableLicenses.filterBy"
        label="Zipcode dropdown selection"
        options={dropdownZipOptions}
        selected={selectedDropdownOptions}
        onSelectionChange={onZipSelectionChange}
    />
  );
}

export default ZipCodeFilter;
