import FilterDropdown from "@/components/ui/filter-dropdown";
import {
  eligibleBostonZipcodes,
} from "@/services/data-interface/data-interface";
import { EligibleBostonZipcode } from "@/services/data-interface/data-interface";
import { Selection } from "react-aria-components";
import { useCallback, useEffect, useMemo, useState } from "react";


interface ZipCodeFilterProps {
  setZipcodeList: (zipCodes: Set<EligibleBostonZipcode>) => void
}


const ZipCodeFilter = ({ setZipcodeList }: ZipCodeFilterProps) => {
  const [selectedDropdownOptions, setSelectedDropdownOptions] =
    useState<Selection>(new Set());

    useEffect(() => {
      setZipcodeList(eligibleBostonZipcodes);
    }, [setZipcodeList]);

  const dropdownZipOptions = useMemo(
    () =>
      [...eligibleBostonZipcodes].map((zip, index) => ({
        id: `react-aria-${index + 1}`,
        name: String(zip),
      })),
    []
  );

  const onZipSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedDropdownOptions(new Set(keys as Set<string>));

      const selectedOptions = dropdownZipOptions.filter((option) =>
        (keys as Set<string>).has(option.id.toString())
      );

      // Get zipcodes from selected options
      const zipcodes = selectedOptions.map(
        (option) => option.name as EligibleBostonZipcode // assuming option.name is the zipcode
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
        titleId="database.filter.zipCode"
        label="Zipcode dropdown selection"
        options={dropdownZipOptions}
        selected={selectedDropdownOptions}
        onSelectionChange={onZipSelectionChange}
    />
  );
}

export default ZipCodeFilter;