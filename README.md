# Reactive Data Table

## Project Overview

This project aims to build a responsive, editable data table application using Next.js, TailwindCSS, and Supabase. The project is successfully deployed on Vercel and can be accessed at: [reactive-data-table](https://reactive-data-table.vercel.app/)

## Features

1. **UI Design**:
   - The UI components are designed using TailwindCSS to ensure a clean and responsive design.
   - The data table supports sorting, searching, and pagination.

2. **Functionality**:
   - **CRUD Operations**: Users can create, read, update, and delete data.
   - **Pagination**: Implemented pagination controls allow users to navigate through the data and select the number of rows per page.
   - **Search**: Supports case-insensitive search by ID and name.
   - **Sorting**: Supports ascending and descending sorting by columns.
   - **Real-Time Updates**: Utilizes Supabase's real-time features to reflect data changes immediately across all clients.
   - **Image Upload**: Users can upload images to table cells (file size < 2MB). Images are displayed as thumbnails, which can be clicked to view the full image.

3. **Supabase Configuration**:
   - **Table**: Created a table named `Example` in Supabase with the following fields:
     - `id` (int8)
     - `name` (text)
     - `age` (int2)
     - `birthday` (date)
     - `profile_picture` (text)
   - **Bucket**: Created a bucket named `avatars` for storing uploaded image files.
   - **Row Level Security (RLS) Policies**: Created a policy to allow public access for data reading:
     ```sql
     create policy "Public select policy"
     on "public"."Example"
     as permissive
     for select
     to public
     using (true);
     ```
   - **RPC Function**: Created a custom RPC function for adding new columns:
     ```sql
     CREATE OR REPLACE FUNCTION add_column(table_name text, column_name text, column_type text)
     RETURNS void AS $$
     BEGIN
       EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', table_name, column_name, column_type);
     END;
     $$ LANGUAGE plpgsql;
     ```

## Accessing the Project

You can access the project at the following URL:
[reactive-data-table](https://reactive-data-table.vercel.app/)

## Contributors

Thank you to everyone who contributed to this project!

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
