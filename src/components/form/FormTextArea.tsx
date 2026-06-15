"use client";

import { Form, Input } from "antd";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface FormTextAreaProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export function FormTextArea<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rows = 3,
}: FormTextAreaProps<T>) {
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
          <Input.TextArea {...field} placeholder={placeholder} rows={rows} />
        </Form.Item>
      )}
    />
  );
}
