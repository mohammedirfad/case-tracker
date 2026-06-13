import { useMemo, useState } from "react";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;
export type Validator<T> = (values: T) => FieldErrors<T>;

export function useFormValidation<T extends Record<string, unknown>>(initialValues: T, validator: Validator<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const isValid = useMemo(() => Object.keys(validator(values)).length === 0, [validator, values]);

  function setField<K extends keyof T>(field: K, value: T[K]) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) setErrors(validator(next));
  }

  function markTouched<K extends keyof T>(field: K) {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(validator(values));
  }

  function validateAll() {
    const nextErrors = validator(values);
    setErrors(nextErrors);
    setTouched(
      Object.keys(values).reduce<Partial<Record<keyof T, boolean>>>((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {})
    );
    return Object.keys(nextErrors).length === 0;
  }

  function reset(nextValues = initialValues) {
    setValues(nextValues);
    setErrors({});
    setTouched({});
  }

  return { values, errors, touched, isValid, setField, markTouched, validateAll, reset };
}
