import { Button, IconCross } from 'hds-react';
import { SetStateAction, WritableAtom, useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { Fragment, MouseEventHandler } from 'react';

import SearchComponents from '../enum/SearchComponents';
import { getLanguageLabel } from '../helpers/Language';
import { transformDropdownsValues } from '../helpers/Params';
import {
  continuousAtom,
  employmentAtom,
  employmentSelectionAtom,
  internshipAtom,
  languageSelectionAtom,
  resetFormAtom,
  summerJobsAtom,
  taskAreasAtom,
  taskAreasSelectionAtom,
  urlAtom,
  urlUpdateAtom,
  youthSummerJobsAtom,
} from '../store';
import OptionType from '../types/OptionType';

const SelectionsContainer = () => {
  const urlParams = useAtomValue(urlAtom);
  const resetForm = useUpdateAtom(resetFormAtom);
  const taskAreaOptions = useAtomValue(taskAreasAtom);
  const updateTaskAreas = useUpdateAtom(taskAreasSelectionAtom);
  const employmentOptions = useAtomValue(employmentAtom);
  const updateEmploymentOptions = useUpdateAtom(employmentSelectionAtom);

  const showClearButton =
    urlParams?.task_areas?.length ||
    urlParams?.continuous ||
    urlParams?.internship ||
    urlParams?.language ||
    urlParams?.summer_jobs ||
    urlParams?.youth_summer_jobs;

  const showTaskAreas = Boolean(urlParams.task_areas?.length && urlParams.task_areas.length > 0);
  const showEmployment = Boolean(urlParams.employment?.length && urlParams.employment?.length > 0);

  return (
    <div className='job-search-form__selections-wrapper'>
      <ul className='job-search-form__selections-container content-tags__tags'>
        {showTaskAreas && (
          <ListFilter
            updater={updateTaskAreas}
            valueKey={SearchComponents.TASK_AREAS}
            values={transformDropdownsValues(urlParams.task_areas, taskAreaOptions)}
          />
        )}
        {showEmployment && (
          <ListFilter
            updater={updateEmploymentOptions}
            valueKey={SearchComponents.EMPLOYMENT}
            values={transformDropdownsValues(urlParams.employment, employmentOptions)}
          />
        )}
        {urlParams.language && (
          <SingleFilter
            label={getLanguageLabel(urlParams.language)}
            atom={languageSelectionAtom}
            valueKey={SearchComponents.LANGUAGE}
          />
        )}
        {urlParams.continuous && (
          <CheckboxFilterPill
            label={Drupal.t('Open-ended vacancies', {}, { context: 'Job search' })}
            atom={continuousAtom}
            valueKey={SearchComponents.CONTINUOUS}
          />
        )}
        {urlParams.internship && (
          <CheckboxFilterPill
            label={Drupal.t('Practical training', {}, { context: 'Job search' })}
            atom={internshipAtom}
            valueKey={SearchComponents.INTERNSHIPS}
          />
        )}
        {urlParams.summer_jobs && (
          <CheckboxFilterPill
            label={Drupal.t('Summer jobs', {}, { context: 'Job search' })}
            atom={summerJobsAtom}
            valueKey={SearchComponents.SUMMER_JOBS}
          />
        )}
        {urlParams.youth_summer_jobs && (
          <CheckboxFilterPill
            label={Drupal.t('Summer jobs for young people', {}, { context: 'Job search' })}
            atom={youthSummerJobsAtom}
            valueKey={SearchComponents.YOUTH_SUMMER_JOBS}
          />
        )}
        <li className='job-search-form__clear-all'>
          <Button
            aria-hidden={showClearButton ? 'true' : 'false'}
            className='job-search-form__clear-all-button'
            iconLeft={<IconCross className='job-search-form__clear-all-icon' />}
            onClick={resetForm}
            style={showClearButton ? {} : { visibility: 'hidden' }}
            variant='supplementary'
          >
            {Drupal.t('Clear selections', {}, { context: 'Job search clear selections' })}
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default SelectionsContainer;

type ListFilterProps = {
  updater: Function;
  valueKey: string;
  values: OptionType[];
};

const ListFilter = ({ updater, values, valueKey }: ListFilterProps) => {
  const urlParams = useAtomValue(urlAtom);
  const setUrlParams = useUpdateAtom(urlUpdateAtom);

  const removeSelection = (value: string) => {
    const newValue = values;
    const index = newValue.findIndex((selection: OptionType) => selection.value === value);
    newValue.splice(index, 1);
    updater(newValue);
    setUrlParams({
      ...urlParams,
      [valueKey]: newValue.map((selection: OptionType) => selection.value),
    });
  };

  return (
    <Fragment>
      {values.map((selection: OptionType) => (
        <FilterButton
          value={selection.simpleLabel || selection.label}
          clearSelection={() => removeSelection(selection.value)}
          key={selection.value}
        />
      ))}
    </Fragment>
  );
};

type CheckboxFilterPillProps = {
  atom: WritableAtom<boolean, SetStateAction<boolean>, void>;
  valueKey: string;
  label: string;
};

const CheckboxFilterPill = ({ atom, valueKey, label }: CheckboxFilterPillProps) => {
  const setValue = useUpdateAtom(atom);
  const urlParams = useAtomValue(urlAtom);
  const setUrlParams = useUpdateAtom(urlUpdateAtom);

  return (
    <FilterButton
      value={label}
      clearSelection={() => {
        setUrlParams({ ...urlParams, [valueKey]: false });
        setValue(false);
      }}
    />
  );
};

type SingleFilterProps = {
  atom: WritableAtom<OptionType | null, SetStateAction<OptionType | null>, void>;
  valueKey: string;
  label: string;
};
const SingleFilter = ({ atom, valueKey, label }: SingleFilterProps) => {
  const setValue = useUpdateAtom(atom);
  const urlParams = useAtomValue(urlAtom);
  const setUrlParams = useUpdateAtom(urlUpdateAtom);

  const { language, ...updatedParams } = urlParams;

  return (
    <FilterButton
      value={label}
      clearSelection={() => {
        setUrlParams(updatedParams);
        setValue(null);
      }}
    />
  );
};

type FilterButtonProps = {
  value: string;
  clearSelection: MouseEventHandler<HTMLLIElement>;
};

const FilterButton = ({ value, clearSelection }: FilterButtonProps) => {
  return (
    <li
      className='content-tags__tags__tag content-tags__tags--interactive'
      key={'test' + value.toString()}
      onClick={clearSelection}
    >
      <Button
        aria-label={Drupal.t(
          'Remove @item from search results',
          { '@item': value.toString() },
          { context: 'Search: remove item aria label' }
        )}
        className='job-search-form__remove-selection-button'
        iconRight={<IconCross />}
        variant='supplementary'
      >
        {value}
      </Button>
    </li>
  );
};
