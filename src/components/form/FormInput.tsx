"use client";

import { Form, Input } from "antd";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import type { ReactNode } from "react";

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: "text" | "password";
  prefix?: ReactNode;
}

/** RHF-controlled AntD text/password input with inline validation. */
export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  prefix,
}: FormInputProps<T>) {
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
          {type === "password" ? (
            <Input.Password {...field} placeholder={placeholder} prefix={prefix} />
          ) : (
            <Input {...field} placeholder={placeholder} prefix={prefix} />
          )}
        </Form.Item>
      )}
    />
  );
}
