import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { login } from "../../features/AxiosInstance/Auth/Auth";


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  const authState = useSelector((state) => state.auth);
  const loading = authState.status === "loading";

  // Get the redirect path from location state
  const from = location.state?.from || "/";

  const handleSubmit = async (values) => {
    try {
      const result = await dispatch(login({
        email: values.email,
        password: values.password
      })).unwrap();
      
      message.success("Đăng nhập thành công!");
      
      // Redirect based on user role
      if (result.userRole === "Admin") {
        navigate("/admin");
      } else {
        navigate(from);
      }
    } catch (error) {
      console.error("Login error:", error);
      // Handle different error formats
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || error?.response?.data || "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.";
      message.error(errorMessage);
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      // Redirect if already authenticated
      if (authState.userRole === "Admin") {
        navigate("/admin");
      } else {
        navigate(from);
      }
    }
  }, [authState.isAuthenticated, authState.userRole, navigate, from]);

  return (
    <div className="h-screen w-full md:top-20 flex relative">

      {/* LoginForm */}
       <motion.div
         className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-[70%] w-full max-w-xl shadow-xl z-10"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.2 }}
       >
        <div className="relative w-full max-w-xl min-h-[500px] mx-auto border border-gray-300 shadow-xl rounded-3xl p-10 bg-white">
          <div className="absolute top-4 right-4 md:top-8 md:right-8 text-sm">
            <span className="text-gray-500">No Account?</span> <br />
            <Link
              to="/auth/signup"
              className="text-primary-600 font-medium hover:underline transition-all"
            >
              Sign up
            </Link>
          </div>
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="text-sm font-normal mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Welcome to TechZone
            </motion.h2>

            <motion.h1
              className="text-4xl font-bold mb-8 text-primary-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Sign in
            </motion.h1>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
              className="w-full"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Form.Item
                  name="email"
                  label="Enter your Email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                  className="mb-6"
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Email address"
                    className="py-3"
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Form.Item
                  name="password"
                  label="Enter your Password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                  ]}
                  className="mb-2"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Password"
                    className="py-3"
                    autoComplete="current-password"
                  />
                </Form.Item>
                <div className="flex justify-end mb-6">
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs text-primary-500 hover:underline transition-all"
                  >
                    Forgot Password
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full h-12 bg-gradient-to-br from-primary to-secondary border-none hover:from-primary-600 hover:to-secondary-600 text-white font-medium"
                    style={{
                      background: loading
                        ? undefined
                        : "linear-gradient(135deg, #50bbf5 0%, #5069f5 100%)",
                    }}
                  >
                    Sign in
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
