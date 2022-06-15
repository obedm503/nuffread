import { Menu, Transition } from '@headlessui/react';
import { Field, Form, Formik } from 'formik';
import {
  addOutline,
  cart,
  chatbubblesOutline,
  logOutOutline,
  personCircleOutline,
} from 'ionicons/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useCallback } from 'react';
import { useMutation } from '../apollo/client';
import { LogoutDocument as LOGOUT } from '../queries';
import { useIsLoggedIn } from '../util/auth';
import { Icon } from './icon';

function AccountButton() {
  const [logout, { client }] = useMutation(LOGOUT);
  const router = useRouter();
  const handleLogout = useCallback(async () => {
    try {
      const res = await logout();
      if (res.data?.logout) {
        await client.resetStore();
        await router.push('/');
      }
    } catch {}
  }, [logout, client, router]);

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="ml-4 rounded-full focus:outline-none flex items-center">
        <Icon icon={personCircleOutline} />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute top-6 right-0 mt-2 text-right origin-top-right rounded-md bg-white shadow-lg focus:outline-none border border-dark z-10">
          <div className="px-1 py-1 flex flex-col">
            <Menu.Item>
              <Link href="/profile">
                <a className="hover:bg-primary hover:text-white text-gray-900 group rounded-md px-2 py-2 flex items-center justify-start">
                  <Icon icon={personCircleOutline} className="mr-2" /> Profile
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item>
              <button
                onClick={handleLogout}
                className="hover:bg-primary hover:text-white text-gray-900 group rounded-md px-2 py-2 flex items-center justify-start"
              >
                <Icon icon={logOutOutline} className="mr-2" /> Logout
              </button>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function LoggedInButtons() {
  return (
    <>
      <div className="flex rounded-lg overflow-hidden border border-dark">
        <Link href="/cart">
          <a className="outline-none focus:outline-none px-3 py-1 bg-white flex items-center hover:bg-dark hover:text-white">
            <Icon icon={cart} className="mr-2" />
            Cart
          </a>
        </Link>

        <Link href="/chat">
          <a className="outline-none focus:outline-none px-3 py-1 bg-white border-l border-l-dark flex items-center hover:bg-dark hover:text-white">
            <Icon icon={chatbubblesOutline} className="mr-2" />
            Chat
          </a>
        </Link>

        <Link href="/post">
          <a className="outline-none focus:outline-none px-3 py-1 bg-white border-l border-l-dark flex items-center hover:bg-dark hover:text-white">
            <Icon icon={addOutline} className="mr-2" />
            Post
          </a>
        </Link>
      </div>

      <div className="hidden sm:inline-block ">
        <AccountButton />
      </div>
    </>
  );
}
function LoggedOutButtons() {
  return (
    <>
      <Link href="/login">
        <a className="text-lg font-semibold no-underline text-primary uppercase px-2 py-1">
          Login
        </a>
      </Link>
      <Link href="/join">
        <a className="text-lg font-semibold no-underline bg-primary text-white uppercase ml-2 px-2 py-1 rounded-sm">
          Join
        </a>
      </Link>
    </>
  );
}

function SearchBar() {
  const router = useRouter();
  const onSubmit = useCallback(
    ({ search }) => {
      router.push({ pathname: '/search', query: { q: search } });
    },
    [router],
  );
  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={{ search: router.query?.q || '' }}
    >
      <Form className="relative mx-auto text-medium">
        <Field
          className="w-full border-2 border-light bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          type="search"
          name="search"
          placeholder="Search"
        />
        <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
          <svg
            className="text-dark h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            x="0px"
            y="0px"
            viewBox="0 0 56.966 56.966"
            xmlSpace="preserve"
            width="512px"
            height="512px"
          >
            <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
          </svg>
        </button>
      </Form>
    </Formik>
  );
}

export function Navbar() {
  const isLoggedIn = useIsLoggedIn();

  return (
    <nav className="flex flex-col sm:flex-row text-center content-center sm:text-left items-stretch py-2 px-6 bg-white shadow w-full space-y-3 sm:space-y-0">
      <div className="inner flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl no-underline text-primary font-sans font-semibold">
            nuffread
          </a>
        </Link>

        <div className="sm:hidden">
          {isLoggedIn ? <AccountButton /> : <LoggedOutButtons />}
        </div>
      </div>

      <div className="w-full sm:mx-5 sm:my-0">
        <SearchBar />
      </div>

      <div className="self-center">
        <div className="flex items-center">
          {isLoggedIn ? <LoggedInButtons /> : <LoggedOutButtons />}
        </div>
      </div>
    </nav>
  );
}
