import BlogEditor from "../BlogEditor";
export default async function EditBlogPage({ params }) { const { id } = await params; return <BlogEditor blogId={id} />; }
