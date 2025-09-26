import TechBackground from '../../components/Auth/TechBackground';
import LoginForm from '../../components/Auth/LoginForm';
import GradientText from '../../components/ReactBitsComponent/GradientText';

const Login = () => {
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

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;