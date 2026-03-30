"use client";

import { CardContainer, CardBody, CardItem } from '../components/3dCard';

const blogsData = [
  {
    id: 1,
    title: "Setting up NextAuth (Auth.js) with Credentials and OAuth (Google, GitHub, etc.) in Next.js",
    description:
      "A comprehensive guide to integrating NextAuth (Auth.js) into your Next.js application, covering both credentials-based authentication and OAuth providers like Google and GitHub. This article walks you through the setup process, configuration options, and best practices for securing your authentication flow.",
    imageUrl: "/assets/blog/1.png",
    blogLink: "https://medium.com/@skywalkerX/setting-up-nextauth-authjs-with-credentials-and-oauth-google-github-etc-in-next-js-38414db20972",
    tags: ["Authentication", "Next.js", "NextAuth", "OAuth", "Google", "GitHub"],
  },
  {
    id: 2,
    title: "Next.js Under the Hood",
    description:
      "A deep dive into the inner workings of Next.js, exploring its architecture, rendering strategies, and performance optimizations. This article provides insights into how Next.js handles server-side rendering, static site generation, and client-side navigation.",
    imageUrl: "/assets/blog/2.png",
    blogLink: "https://medium.com/@skywalkerX/nextjs-under-the-hood-8fd40a64079b",
    tags: ["Next.js", "Web Development", "Performance", "SSR", "SSG", "Edge Functions"],
  },
];

const BlogContent = ({ title, description, tags, blogLink }) => (
  <div className="flex-1 p-4 md:p-6 text-[var(--text-on-dark)]">
    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
      {title}
    </h3>
    <p className="text-[var(--palette-light-purple)] mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
      {description}
    </p>
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-[var(--palette-dark-purple)] border border-[var(--palette-mid-purple)] text-[var(--palette-light-purple)] px-3 py-1.5 rounded-full text-xs sm:text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="flex flex-wrap gap-3 sm:gap-4">
      <a
        href={blogLink}
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors text-sm sm:text-base"
      >
        View Blog
      </a>
    </div>
  </div>
);

export function BlogsSection() {
  return (
    <section className="bg-[var(--bg-original-dark)] py-16 md:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16 md:mb-24">
          My <span className="text-[hsl(var(--primary))]">Blogs</span>
        </h2>

        {/* Blog Cards */}
        <div className="space-y-20 md:space-y-28 lg:space-y-32">
          {blogsData.map((blog, index) => {
            const isReversed = index % 2 !== 0;

            const blogCard3D = (
              <CardContainer
                className="bg-[var(--palette-dark-purple)] border border-[var(--palette-mid-purple)] rounded-xl shadow-2xl
                         w-[280px] h-auto
                         sm:w-[400px] sm:h-[240px]
                         md:w-[450px] md:h-[270px]"
                containerClassName="w-full flex justify-center items-center py-4 md:mt-0"
              >
                <CardBody className="w-full h-full">
                  <CardItem
                    as="div"
                    translateZ={60}
                    rotateX={isReversed ? -5 : 5}
                    rotateY={isReversed ? 5 : -5}
                    className="w-full h-full rounded-xl overflow-hidden"
                  >
                    <img
                      src={blog.imageUrl}
                      alt={`${blog.title} thumbnail`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </CardItem>
                </CardBody>
              </CardContainer>
            );

            return (
              <div
                key={blog.id}
                className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center md:items-center gap-8 md:gap-12 lg:gap-16`}
              >
                <div className="w-full md:w-5/12 lg:w-1/2 flex justify-center items-center">
                  {blogCard3D}
                </div>
                <div className="w-full md:w-7/12 lg:w-1/2 relative z-10">
                  <BlogContent
                    title={blog.title}
                    description={blog.description}
                    tags={blog.tags}
                    blogLink={blog.blogLink}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Docs & Resume Section */}
        <div className="mt-24 md:mt-32">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            {/* Docs Card */}
            <div className="w-full md:w-1/2 max-w-lg bg-[var(--palette-dark-purple)] border border-[var(--palette-mid-purple)] rounded-xl p-8 text-center">
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mx-auto text-[hsl(var(--primary))]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">My Docs</h3>
              <p className="text-[var(--palette-light-purple)] mb-6 text-base leading-relaxed">
                Explore my technical documentation, guides, and notes — all in one place.
              </p>
              <a
                href="https://docs.namankhandelwal.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors text-sm sm:text-base"
              >
                Visit Docs
              </a>
            </div>

            {/* Resume Card */}
            <div className="w-full md:w-1/2 max-w-lg bg-[var(--palette-dark-purple)] border border-[var(--palette-mid-purple)] rounded-xl p-8 text-center">
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mx-auto text-[hsl(var(--primary))]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">My Resume</h3>
              <p className="text-[var(--palette-light-purple)] mb-6 text-base leading-relaxed">
                Download or view my resume to learn more about my experience and skills.
              </p>
              <a
                href="/assets/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-lg border border-[var(--palette-mid-purple)] text-[var(--palette-light-purple)] font-semibold hover:bg-[var(--palette-dark-purple)] hover:border-[var(--palette-light-purple)] transition-colors text-sm sm:text-base"
              >
                View Resume
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
