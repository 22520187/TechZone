import React from "react";
import { motion } from "framer-motion";
import { Users, ChevronDown } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2, // Hiệu ứng từng card xuất hiện lần lượt
    },
  },
};

const teamMembers = [
  {
    name: "Bùi Khánh Đang",
    role: "Project Leader",
    bio: "Contact info: 22520187@gm.uit.edu.vn",
    image:
      "https://tse1.mm.bing.net/th/id/OIP.aTIJhZW9eQlg9msWJBZ_ewHaKX?pid=Api&P=0&h=180",
  },
  {
    name: "Võ Lê Quốc Đạt",
    role: "Member",
    bio: "Contact info: 22520242@gm.uit.edu.vn",
    image:
      "https://tse4.mm.bing.net/th/id/OIP.VWiq9XJszYmJnO9lA3NrmwHaHa?pid=Api&P=0&h=180",
  },
  {
    name: "Lý Nguyễn Anh Duy",
    role: "Member",
    bio: "Contact info: 22520319@gm.uit.edu.vn",
    image:
      "https://tse1.mm.bing.net/th/id/OIP.5zlxsY5Q6kqqwq0xQpMK1gHaQY?pid=Api&P=0&h=180",
  },
  {
    name: "Nguyễn Tuấn Lộc",
    role: "Member",
    bio: "Contact info: 23520862@gm.uit.edu.vn",
    image:
      "https://tse2.mm.bing.net/th/id/OIP.3v5GfoQ9J76uIfniOixeegHaIr?pid=Api&P=0&h=180",
  },
];

const MeetTheTeamSection = () => {
  return (
    <section className="bg-background  bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 rounded-4xl">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        {/* Tiêu đề */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-primary-300">
              Meet the Team
            </h2>
          </div>
          <h3 className="text-4xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-bold mb-2">
            The Experts Behind TechZone
          </h3>
          <p className="text-muted-foreground text-gray-600 text-base font-medium">
            Our diverse team of tech enthusiasts and e-commerce experts are
            passionate about bringing you the best products and shopping
            experience.
          </p>
        </motion.div>

        {/* Danh sách thành viên nhóm */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {teamMembers.map((member, index) => (
            <motion.div key={index} variants={fadeUp}>
              <div className="group bg-card border rounded-xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-lg mb-1">{member.name}</h4>
                  <p className="text-primary font-medium text-sm mb-3">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MeetTheTeamSection;
