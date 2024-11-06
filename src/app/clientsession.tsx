'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
export default function clientsession() {
  const { data: session, status, update } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (session?.user) {
    const { id, role, name, email, image } = session.user;
    return (
      <>
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
        <button onClick={() => update()}>Refresh</button>
      </>
    );
  }
  return (
    <p>
      No user session found
      <Link href='/api/auth/signin'>Sign in</Link>
      <button
        onClick={() =>
          update({
            force: true,
          })
        }
      >
        Refresh
      </button>
    </p>
  );
}
