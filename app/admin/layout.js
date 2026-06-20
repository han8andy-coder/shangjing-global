export const metadata = {
  title: {
    default: "客户管理后台",
    template: "%s | 商镜Global",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return children;
}
