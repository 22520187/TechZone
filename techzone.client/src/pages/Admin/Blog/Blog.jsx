import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { message, Spin, Modal, Form, Input, Switch, Popconfirm } from "antd";
import {
  fetchAllBlogPosts,
  addBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../../../features/Admin/Blog/Blog";
import api from "../../../features/AxiosInstance/AxiosInstance";
import dayjs from "dayjs";

export default function Blog() {
  const dispatch = useDispatch();
  const { blogPosts, status, error } = useSelector((state) => state.blog);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBlogPost, setCurrentBlogPost] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Image upload state
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      await dispatch(fetchAllBlogPosts()).unwrap();
    } catch (err) {
      message.error("Failed to fetch blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, [dispatch]);

  const showAddModal = () => {
    setIsEditMode(false);
    setCurrentBlogPost(null);
    setImageUrl("");
    setIsModalOpen(true);
    form.resetFields();
  };

  const showEditModal = (blogPost) => {
    setIsEditMode(true);
    setCurrentBlogPost(blogPost);
    setImageUrl(blogPost.imageUrl || "");
    setIsModalOpen(true);
    form.setFieldsValue({
      title: blogPost.title,
      description: blogPost.description,
      content: blogPost.content,
      isPublished: blogPost.isPublished,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await api.post("/api/Image/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          folder: "blog",
        },
      });
      setImageUrl(response.data.imageUrl);
      message.success("Image uploaded successfully");
    } catch (error) {
      message.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setImageUrl("");
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const blogPostData = {
        title: values.title,
        description: values.description || "",
        content: values.content || "",
        imageUrl: imageUrl || "",
        isPublished: values.isPublished || false,
      };

      if (isEditMode && currentBlogPost) {
        await dispatch(
          updateBlogPost({
            blogPostId: currentBlogPost.blogPostId,
            blogPostData,
          })
        ).unwrap();
        message.success("Blog post updated successfully");
      } else {
        await dispatch(addBlogPost(blogPostData)).unwrap();
        message.success("Blog post added successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
      setImageUrl("");
    } catch (err) {
      message.error(`Failed to ${isEditMode ? "update" : "add"} blog post`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (blogPostId) => {
    try {
      await dispatch(deleteBlogPost(blogPostId)).unwrap();
      message.success("Blog post deleted successfully");
    } catch (err) {
      message.error("Failed to delete blog post");
    }
  };

  const filteredBlogPosts = (blogPosts || []).filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800">Blog Management</h1>

      {/* Header */}
      <div className="flex justify-between">
        <div className="relative w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border rounded-full text-sm focus:outline-none focus:border-primary-600"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          className="flex items-center py-2 px-5 text-white bg-primary rounded-lg font-bold text-sm hover:bg-primary-600 active:scale-95 transition-all duration-100"
          onClick={showAddModal}
        >
          <Plus size={16} className="mr-1" />
          <span className="cursor-pointer">Add Blog Post</span>
        </button>
      </div>

      {/* Blog Posts Grid */}
      {loading || status === "loading" ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Loading blog posts..." />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          Error loading blog posts: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogPosts.map((post) => (
            <motion.div
              key={post.blogPostId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {post.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {post.description || "No description"}
                </p>

                <div className="text-xs text-gray-400 mb-3">
                  <div>By: {post.authorName || "Unknown"}</div>
                  <div>
                    {dayjs(post.createdAt).format("MMM DD, YYYY")}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <button
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    onClick={() => showEditModal(post)}
                  >
                    <Pencil size={16} />
                  </button>
                  <Popconfirm
                    title="Delete Blog Post"
                    description="Are you sure you want to delete this blog post?"
                    onConfirm={() => handleDelete(post.blogPostId)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={isEditMode ? "Edit Blog Post" : "Add New Blog Post"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter the title" }]}
          >
            <Input placeholder="Enter blog post title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Enter short description"
              rows={3}
            />
          </Form.Item>

          <Form.Item label="Cover Image">
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {uploading && <Spin size="small" />}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover rounded-md"
                />
              )}
            </div>
          </Form.Item>

          <Form.Item name="content" label="Content">
            <Input.TextArea
              placeholder="Enter blog post content"
              rows={8}
            />
          </Form.Item>

          <Form.Item
            name="isPublished"
            label="Publish Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Published" unCheckedChildren="Draft" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              disabled={submitting}
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                ? "Update Blog Post"
                : "Add Blog Post"}
            </button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
