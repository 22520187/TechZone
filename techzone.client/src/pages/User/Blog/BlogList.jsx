import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublishedBlogPosts } from "../../../features/Admin/Blog/Blog";
import { Spin, message } from "antd";
import { Calendar, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function BlogList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { blogPosts, status } = useSelector((state) => state.blog);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        await dispatch(fetchPublishedBlogPosts()).unwrap();
      } catch (error) {
        message.error("Failed to load blog posts");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [dispatch]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary-600">
            TechZone Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover news, reviews and guides about the latest technology
          </p>
        </div>

        {/* Blog Posts Grid */}
        {blogPosts && blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <motion.div
                key={post.blogPostId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-primary-200 transition-all duration-300"
                onClick={() => navigate(`/blog/${post.blogPostId}`)}
              >
                {/* Image */}
                <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative group">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-300">
                        <span className="text-7xl">📝</span>
                      </div>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {post.description || "Nhấn để xem chi tiết..."}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <User size={14} className="text-primary-500" />
                      <span className="font-medium">{post.authorName || "TechZone"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-primary-500" />
                      <span>{dayjs(post.createdAt).format("MMM DD, YYYY")}</span>
                    </div>
                  </div>

                  {/* Read More */}
                  <div className="flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors group">
                    <span>Đọc thêm</span>
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-8xl mb-4">📝</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Chưa có bài viết nào
              </p>
              <p className="text-gray-500">
                Các bài viết mới sẽ sớm được cập nhật
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
