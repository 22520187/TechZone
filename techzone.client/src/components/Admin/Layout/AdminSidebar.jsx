import { motion } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag,
  ListOrdered, Tag, Calendar, CheckSquare,
  Users, FileText, Layout, UsersRound, Table, Settings, LogOut,
  ChevronLeft, ChevronRight,
  Slack,
  Boxes,
  Users2,
  TicketPercent,
  Shield,
  UserCog,
  BookOpen
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import GradientText from "../../ReactBitsComponent/GradientText";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../features/AxiosInstance/Auth/Auth";
import { toast } from "sonner";

const SidebarItem = ({ icon: Icon, label, path, isActive = false, isCollapsed, onClick }) => {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className="animate-fade-in"
    >
      {path === "/logout" ? (
        <button
          onClick={onClick}
          className={`flex gap-3 px-4 py-3 text-base rounded-xl items-center transition-all duration-300 w-full ${
            isActive
              ? 'bg-primary text-white font-medium'
              : 'text-gray-600 hover:bg-primary-50'
          } ${isCollapsed ? 'justify-around' :'' }`}
        >
          <Icon size={20} />
          {!isCollapsed && <span>{label}</span>}
        </button>
      ) : (
        <Link
          to={path}
          className={`flex gap-3 px-4 py-3 text-base rounded-xl items-center transition-all duration-300 ${
            isActive
              ? 'bg-primary text-white font-medium'
              : 'text-gray-600 hover:bg-primary-50'
          } ${isCollapsed ? 'justify-around' :'' }`}
        >
          <Icon size={20} />
          {!isCollapsed && <span>{label}</span>}
        </Link>
      )}
    </motion.div>
  );
};

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.auth.userRole);

  const handleLogout = () => {
    // Show confirmation message before logout
    if (confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      toast.success("Logout successful");
      // Force a page reload to ensure all state is cleared
      window.location.href = "/auth/login";
    }
  };

  // Define menu items for different roles
  const allMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard", roles: ["Admin"] },
    { icon: ShoppingBag, label: "Products", path: "/admin/products", roles: ["Admin"] },
    { icon: ListOrdered, label: "Order", path: "/admin/orders", roles: ["Admin", "Staff"] },
    { icon: BookOpen, label: "Blog Posts", path: "/admin/blog", roles: ["Admin", "Staff"] },
    { icon: Slack, label: "Brands", path: "/admin/brands", roles: ["Admin"] },
    { icon: Boxes, label: "Categories", path: "/admin/categories", roles: ["Admin"] },
    { icon: Users2, label: "Customers", path: "/admin/customers", roles: ["Admin"] },
    { icon: UserCog, label: "Staff", path: "/admin/staff", roles: ["Admin"] },
    { icon: TicketPercent, label: "Promotions", path: "/admin/promotions", roles: ["Admin"] },
    { icon: Shield, label: "Warranty Claims", path: "/admin/warranty-claims", roles: ["Admin"] },
    // { icon: Settings, label: "Settings", path: "/admin/settings", roles: ["Admin", "Staff"] },
    { icon: LogOut, label: "Logout", path: "/logout", roles: ["Admin", "Staff"] },
  ];

  // Filter menu items based on user role (case-insensitive)
  const sidebarItems = allMenuItems.filter(item => 
    item.roles.some(role => role.toLowerCase() === userRole?.toLowerCase())
  );

  const pageItems = [
    { icon: Tag, label: "Pricing", path: "/pricing" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: CheckSquare, label: "To-Do", path: "/todo" },
    { icon: Users, label: "Contact", path: "/contact" },
    { icon: FileText, label: "Invoice", path: "/invoice" },
    { icon: Layout, label: "UI Elements", path: "/ui-elements" },
    { icon: UsersRound, label: "Team", path: "/team" },
    { icon: Table, label: "Table", path: "/table" },
  ];

  return (
    <aside className={`h-screen drop-shadow-sm flex flex-col transition-all duration-300 ${
      isCollapsed ? "w-20" : "w-50"
    } bg-white`} >
      <div className="py-2 ps-1 flex justify-evenly items-center">
        <Link to="/admin/dashboard">
            <GradientText
              colors={["#50bbf5", "#5069f5", "#50bbf5", "#5069f5", "#50bbf5"]}
              className={`${isCollapsed ? "text-xl" :"text-2xl"}`}
              animationSpeed={3}
              showBorder={false}
            >
              {isCollapsed ? ("TZ") : ("TechZone")}
            </GradientText>
        </Link>

        <button
          onClick={toggleSidebar}
          className="mt-1 p-1 rounded-full hover:bg-gray-200 transition"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto">
        <motion.div
          className="ps-2 pe-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
        >
          <div className="flex flex-col space-y-2">
            {sidebarItems.map((item) => (
              <div key={item.path}>
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  isActive={location.pathname === item.path}
                  isCollapsed={isCollapsed}
                  onClick={item.path === "/logout" ? handleLogout : undefined}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
