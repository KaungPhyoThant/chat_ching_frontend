"use client";

import { Form, Select } from "antd";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: Option[];
  allowClear?: boolean;
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  allowClear,
}: FormSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Form.Item
          label={label}
          validateStatus={fieldState.error ? "error" : undefined}
          help={fieldState.error?.message}
          style={{ marginBottom: 16 }}
        >
          <Select
            {...field}
            placeholder={placeholder}
            options={options}
            allowClear={allowClear}
            variant="outlined"
            className="app-form-select"
            classNames={{ popup: { root: "app-filter-select-dropdown" } }}
            style={{ width: "100%" }}
          />
        </Form.Item>
      )}
    />
  );
}
