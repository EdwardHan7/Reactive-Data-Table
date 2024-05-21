This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This project aims to build a reactive, editable data table using Next.js, TailwindCSS, and Supabase, similar to the functionality of Clay or Airtable. The table supports CRUD operations, pagination, and real-time updates.

Features
UI Design: All UI components are developed using TailwindCSS features, ensuring a clean and responsive design.    

Sorting: Implemented sorting functionality allows sorting of data based on different columns.

CRUD Operations: The table supports creating, reading, updating, and deleting data.

Pagination: Pagination controls allow users to navigate through the data, with options to select the pagination size.

Real-Time Updates: Utilizes Supabase's real-time capabilities to reflect changes made to the data across all clients immediately.

Search: Search functionality is implemented to filter data based on user input.

Column Filtering: Framework is set up to allow filtering data based on different conditions.

Image Upload: Users can upload images into a cell (less than 2MB). Uploaded images are displayed as thumbnails, which can be clicked to view the full image.

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
