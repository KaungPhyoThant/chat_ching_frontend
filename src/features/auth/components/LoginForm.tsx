"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { App, Button, Flex, Form, Typography } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { FormInput } from "@/components/form/FormInput";
import { ROUTES } from "@/config/routes";
import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginValues } from "../schemas";
import type { ApiError } from "@/lib/api/client";

const { Title, Text } = Typography;

export function LoginForm() {
  const router = useRouter();
  const { message } = App.useApp();
  const loginMutation = useLogin();

  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values);
      router.push(ROUTES.dashboard);
    } catch (err) {
      const apiErr = err as ApiError;
      message.error(apiErr.message || "Sign in failed");
    }
  });

  return (
    <Flex vertical gap={4} style={{ marginBottom: 8 }}>
      <Flex align="center" gap={10} style={{ marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "#1677FF" }} />
        <div>
          <Title level={4} style={{ margin: 0 }}>
            AI Shop Admin
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Telegram store admin
          </Text>
        </div>
      </Flex>

      <Form layout="vertical" onSubmitCapture={onSubmit}>
        <FormInput
          control={control}
          name="email"
          label="Email"
          placeholder="admin@example.com"
          prefix={<MailOutlined />}
        />
        <FormInput
          control={control}
          name="password"
          label="Password"
          type="password"
          placeholder="Enter password"
          prefix={<LockOutlined />}
        />
        <Button
          type="primary"
          htmlType="submit"
          block
          size="middle"
          loading={loginMutation.isPending}
        >
          Sign in
        </Button>
      </Form>
      {/* <Text type="secondary" style={{ fontSize: 12, textAlign: "center", marginTop: 8 }}>
        Demo mode — any email & password (8+ chars) signs you in.
      </Text> */}
    </Flex>
  );
}
