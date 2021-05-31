import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useMe } from '../util/auth';
import { LogoutButton } from './logout';

function MenuItem({ href, name }) {
  const router = useRouter();
  const isActive = router?.pathname === href;
  return (
    <li className="nav-item">
      <Link href={href}>
        <a
          className={`px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug hover:opacity-75  ${
            isActive ? 'text-primary' : ''
          }`}
        >
          {name}
        </a>
      </Link>
    </li>
  );
}

export function Navbar() {
  const { me } = useMe();
  const [active, setActive] = useState(false);
  const toggle = useCallback(() => setActive(a => !!a), [setActive]);

  return (
    <nav className="relative flex flex-wrap items-center justify-between navbar-expand-lg bg-white mb-6 shadow-md">
      <div className="container flex flex-wrap items-center justify-between py-4 max-w-6xl mx-auto">
        <div className="w-full relative flex justify-between lg:w-auto  px-4 lg:static lg:block lg:justify-start">
          <Link href="/">
            <a className="text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-no-wrap uppercase text-primary">
              Nuffread
            </a>
          </Link>
          <button
            className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-primary rounded bg-transparent block lg:hidden outline-none focus:outline-none"
            type="button"
            onClick={toggle}
          >
            <span className="block relative w-6 h-px rounded-sm bg-primary"></span>
            <span className="block relative w-6 h-px rounded-sm bg-primary mt-1"></span>
            <span className="block relative w-6 h-px rounded-sm bg-primary mt-1"></span>
          </button>
        </div>
        <div className="lg:flex flex-grow items-center pr-4">
          <ul className="flex flex-col lg:flex-row list-none ml-auto">
            <MenuItem href="/users" name="Users" />

            <MenuItem href="/schools" name="Schools" />

            <MenuItem href="/sessions" name="Sessions" />

            <li className="nav-item">
              <span className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug">
                {me?.email}
              </span>
            </li>

            <li className="nav-item ml-2">
              <LogoutButton />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
