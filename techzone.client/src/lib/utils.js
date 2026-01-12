import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Hàm tiện ích để merge các class names với Tailwind CSS
 * Sử dụng clsx để kết hợp classes và tailwind-merge để xử lý conflicts
 * 
 * @param {...any} inputs - Các class names cần merge
 * @returns {string} - Chuỗi class names đã được merge
 */
export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};
