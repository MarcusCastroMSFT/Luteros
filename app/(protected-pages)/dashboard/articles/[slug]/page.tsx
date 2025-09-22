interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Article: {params.slug}</h1>
      <p className="text-gray-600">Article editing page coming soon...</p>
    </div>
  );
}
