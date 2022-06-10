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
import { useCallback } from 'react';
import { useMutation } from '../apollo/client';
import { LogoutDocument as LOGOUT } from '../queries';
import { useIsLoggedIn } from '../util/auth';
import { Icon } from './icon';

function useLogout() {
  const [logout, { client }] = useMutation(LOGOUT);
  const router = useRouter();

  return {
    handleLogout: useCallback(async () => {
      try {
        const res = await logout();
        if (res.data?.logout) {
          await client.resetStore();
          await router.push('/');
        }
      } catch {}
    }, [logout, client, router]),
  };
}

function LoggedInButtons() {
  const { handleLogout } = useLogout();
  return (
    <>
      <Link href="/cart">
        <a className="outline-none focus:outline-none px-3 py-1 bg-white rounded-l-lg border-r-0 flex items-center border border-black hover:bg-black hover:text-white">
          <Icon icon={cart} className="mr-2" />
          Cart
        </a>
      </Link>

      <Link href="/chat">
        <a className="outline-none focus:outline-none px-3 py-1 bg-white border-r-0 flex items-center border border-black hover:bg-black hover:text-white">
          <Icon icon={chatbubblesOutline} className="mr-2" />
          Chat
        </a>
      </Link>

      <Link href="/post">
        <a className="outline-none focus:outline-none px-3 py-1 bg-white rounded-r-lg flex items-center border border-black hover:bg-black hover:text-white">
          <Icon icon={addOutline} className="mr-2" />
          Post
        </a>
      </Link>

      <div className="ml-4 group inline-block">
        <button className="outline-none focus:outline-none bg-white rounded-full flex items-center">
          <Icon icon={personCircleOutline} className="w-8" />
        </button>
        <div className="bg-white border border-dark shadow rounded-md transform scale-0 group-hover:scale-100 absolute transition duration-150 ease-in-out origin-top-right right-8 z-10 overflow-hidden">
          <button
            type="button"
            className="px-3 py-1 hover:bg-gray-100 text-lg"
            onClick={handleLogout}
          >
            <Icon icon={logOutOutline} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}

export function Navbar() {
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const onSubmit = useCallback(
    ({ search }) => {
      router.push({ pathname: '/search', query: { q: search } });
    },
    [router],
  );

  return (
    <nav className="flex flex-col-reverse sm:flex-row text-center content-center sm:text-left sm:justify-between py-2 px-6 bg-white shadow sm:items-center w-full">
      <div className="inner self-center">
        <Link href="/">
          <a className="text-2xl no-underline text-primary font-sans font-semibold">
            nuffread
          </a>
        </Link>
      </div>
      <div className="self-center w-full mx-5 my-3 sm:my-0">
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
      </div>
      <div className="self-center">
        <div className="flex items-center">
          {isLoggedIn ? (
            <LoggedInButtons />
          ) : (
            <>
              <Link href="/login">
                <a className="text-lg font-semibold no-underline text-primary uppercase p-2">
                  Login
                </a>
              </Link>
              <Link href="/join">
                <a className="text-lg font-semibold no-underline bg-primary text-white uppercase ml-2 p-2 rounded-sm">
                  Join
                </a>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  /* <nav className="relative flex flex-wrap items-center justify-between navbar-expand-lg bg-white mb-6 shadow-md">
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
    </nav> */
  // );
}
