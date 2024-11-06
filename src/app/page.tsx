import Image from 'next/image';
import { auth } from '@/auth';
import Link from 'next/link';
import { Suspense } from 'react';
import Clientsession from './clientsession';
export default async function Home() {
  const session = await auth();

  return (
    <div>
      <h1>Home</h1>
      <h2>SERVER SESSION</h2>
      {session ? <Auth session={session} /> : <p>No user session found</p>}
      <h2>CLIENT SESSION</h2>
      <Suspense fallback={<p>Loading...</p>}>
        <Clientsession />
      </Suspense>
    </div>
  );
}

function Auth({ session }: { session: any }) {
  const { id, role, name, email, image } = session.user;
  return (
    <div>
      <p>ID: {id}</p>
      <p>Role: {role}</p>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
      <Image
        src={image ? image : '/favicon.ico'}
        alt={name ? name : 'Guest'}
        width={50}
        height={50}
      />
    </div>
  );
}
