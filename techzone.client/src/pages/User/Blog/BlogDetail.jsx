import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogPostById } from "../../../features/Admin/Blog/Blog";
import { Spin, message } from "antd";
import { Calendar, User, ArrowLeft } from "lucide-react";
import dayjs from "dayjs";

export default function BlogDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBlogPost, status } = useSelector((state) => state.blog);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        await dispatch(fetchBlogPostById(id)).unwrap();
      } catch (error) {
        message.error("Failed to load blog post");
        navigate("/blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id, dispatch, navigate]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentBlogPost) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="text-8xl mb-4">😕</div>
          <p className="text-2xl font-bold text-gray-800 mb-2">
            Không tìm thấy bài viết
          </p>
          <p className="text-gray-600 mb-6">
            Bài viết bạn đang tìm không tồn tại hoặc đã bị xóa
          </p>
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/blog")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors z-10 relative cursor-pointer group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:translate-x-[-4px] transition-transform" />
          <span className="font-medium">Quay lại danh sách bài viết</span>
        </button>

        {/* Blog Post Content */}
        <article className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Featured Image */}
          {currentBlogPost.imageUrl && (
            <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              <img
                src={currentBlogPost.imageUrl}
                alt={currentBlogPost.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {currentBlogPost.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b-2 border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                <User size={18} className="text-primary-500" />
                <span className="font-medium">{currentBlogPost.authorName || "TechZone"}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                <Calendar size={18} className="text-primary-500" />
                <span className="font-medium">
                  {dayjs(currentBlogPost.createdAt).format("DD MMMM, YYYY")}
                </span>
              </div>
            </div>

            {/* Description */}
            {currentBlogPost.description && (
              <div className="text-lg md:text-xl text-gray-700 mb-8 p-6 bg-primary-50 border-l-4 border-primary-500 rounded-r-lg italic leading-relaxed">
                {currentBlogPost.description}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                {currentBlogPost.content || "No content available."}
              </div>
            </div>

            {/* Share Section (Optional) */}
            <div className="mt-12 pt-8 border-t-2 border-gray-100">
              <p className="text-gray-600 text-center text-lg font-medium">
                🎉 Cảm ơn bạn đã đọc bài viết!
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
