'use client';

import { trpc } from '@/trpc/client';

export default function Home() {
  const { data, isLoading } = trpc.agents.list.useQuery();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Agents</h1>
      {data?.map((a) => (
        <p key={a.id}>{a.fullName}</p>
      ))}
    </div>
  );
}