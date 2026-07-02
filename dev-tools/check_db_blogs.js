import dbConnect from "./src/lib/dbConnect.js";
import { Blog } from "./src/models/Portfolio.js";
import fs from "fs";

async function checkBlogs() {
    try {
        await dbConnect();
        const blogs = await Blog.find({}).lean();
        const data = blogs.map((b) => ({
            slug: b.slug,
            publishStatus: b.publishStatus,
            featured: b.featured,
            featuredOrder: b.featuredOrder,
            imageStatus: b.imageStatus,
        }));
        fs.writeFileSync("./db_dump.json", JSON.stringify(data, null, 2));
        console.log("Total blogs:", blogs.length);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync("./db_error.txt", err.stack);
        process.exit(1);
    }
}

checkBlogs();