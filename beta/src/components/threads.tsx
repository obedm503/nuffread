import Link from 'next/link';
import { useQuery } from '../apollo/client';
import { Get_ThreadsDocument as GET_THREADS } from '../queries';

export function Threads() {
  const res = useQuery(GET_THREADS, {
    variables: { offset: 0 },
  });
  if (res.error) {
    return null;
  }
  if (res.loading || res.data.me?.__typename === 'Admin') {
    return null;
  }
  return (
    <>
      {res.data.me?.threads.items.map((thread, i) => (
        <Link key={thread.id + i} href={`/chat/${thread.id}`}>
          <a className="flex items-center bg-white overflow-hidden rounded-lg shadow-lg hover:scale-105 transition duration-200 ease-in-out">
            <div>
              <img
                src={thread.listing.book.thumbnail}
                alt={thread.listing.book.title}
                className="w-32"
              />
            </div>
            <div className="p-4">
              <h1 className="text-xl">
                <b>{thread.listing.book.title}</b>
              </h1>
              <h2 className="text-lg">
                {thread.listing.book.authors.join(', ')}
              </h2>
              <h2 className="text-lg">
                Sold by <b>{thread.other.name || thread.other.email}</b>
              </h2>
            </div>
          </a>
        </Link>
      ))}
    </>
  );
}
