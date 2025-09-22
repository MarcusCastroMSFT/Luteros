interface SpecialistPageProps {
  params: {
    username: string;
  };
}

export default function SpecialistPage({ params }: SpecialistPageProps) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Specialist: {params.username}</h1>
      <p className="text-gray-600">Specialist profile page coming soon...</p>
    </div>
  );
}
