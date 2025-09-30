import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from "antd";
import TechBackground from '../../components/Auth/TechBackground';
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import GradientText from '../../components/ReactBitsComponent/GradientText';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Handle signup logic here
    console.log('Signup submitted:', formData);
    navigate('/auth/login');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animated Tech Background */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <TechBackground />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-10">
          <div className="text-center space-y-6 max-w-md">
            <GradientText
              colors={["#50bbf5", "#5069f5", "#50bbf5", "#5069f5", "#50bbf5"]}
              className="text-5xl"
              animationSpeed={3}
              showBorder={false}
            >TechZone Platform</GradientText>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Discover the latest tech essentials with ease, quality, and innovation at TechZone.
            </p>
            <div className="flex space-x-4 justify-center">
              <div className="w-3 h-3 bg-tech-primary rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-tech-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="w-3 h-3 bg-tech-accent rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - SignUp Form */}
      <motion.div
        className="absolute right-20 top-1/2 transform -translate-y-1/2 w-full max-w-xl shadow-xl z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative w-full min-h-[500px] mx-auto border border-gray-300 shadow-xl rounded-3xl p-8 bg-white">
          <div className="absolute top-4 right-4 md:top-8 md:right-8 text-sm">
            <span className="text-gray-500">Have an Account?</span> <br />
            <Link
              to="/auth/login"
              className="text-primary-600 font-medium hover:underline transition-all"
            >
              Sign in
            </Link>
          </div>
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-normal mb-1">Welcome to TechZone</h2>
            <h1 className="text-3xl font-bold mb-6 text-primary-600">
              Sign up
            </h1>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              size="middle"
              className="w-full"
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
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Email address"
                  className="py-3"
                />
              </Form.Item>

              <Form.Item
                name="username"
                label="Enter your Username"
                rules={[
                  { required: true, message: "Please input your username!" },
                  {
                    min: 3,
                    message: "Username must be at least 3 characters!",
                  },
                ]}
                className="mb-6"
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="User name"
                  className="py-3"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Enter your Password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
                  },
                ]}
                className="mb-6"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Password"
                  className="py-3"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp!"));
                    },
                  }),
                ]}
                className="mb-6"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Confirm Password"
                  className="py-3"
                  autoComplete="new-password"
                />
              </Form.Item>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    className="w-full h-12 bg-gradient-to-br from-primary to-secondary border-none hover:from-primary-600 hover:to-secondary-600 text-white font-medium mb-6"
                    style={{
                      background: isLoading
                        ? undefined
                        : "linear-gradient(135deg, #50bbf5 0%, #5069f5 100%)",
                    }}
                  >
                    {isLoading ? "Sending code..." : "Sign up"}
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

export default SignUp;