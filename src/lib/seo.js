export const defaultSeoData = {
  title: "Muhyo Tech - Professional Portfolio",
  description:
    "Innovative solutions for building high-quality web applications.",
  keywords: "muhyo Tech, React, Next.js, Web Development, Portfolio, Projects",
  author: "Muhyo Tech",
  ogImage: "/og.png",
  twitterHandle: "@muhyo-tech",
};

export const generateMetadata = (pageTitle, pageDescription) => {
  return {
    title: pageTitle ? `${pageTitle} | Muhyo Tech` : defaultSeoData.title,
    description: pageDescription || defaultSeoData.description,
    keywords: defaultSeoData.keywords,
    author: defaultSeoData.author,
    openGraph: {
      title: pageTitle || defaultSeoData.title,
      description: pageDescription || defaultSeoData.description,
      images: [
        {
          url: defaultSeoData.ogImage,
          width: 800,
          height: 600,
          alt: "Muhyo Tech",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      creator: defaultSeoData.twitterHandle,
    },
  };
};
