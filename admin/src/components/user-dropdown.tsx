import Popper from 'popper.js';
import { createRef, useState } from 'react';

export const UserDropdown = () => {
  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const btnDropdownRef = createRef<HTMLAnchorElement>();
  const popoverDropdownRef = createRef<HTMLDivElement>();
  const openDropdownPopover = () => {
    new Popper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: 'bottom-end',
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };
  return (
    <>
      <a
        className="text-gray-600 block"
        href="#pablo"
        ref={btnDropdownRef}
        onClick={e => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <div className="items-center flex">
          <span className="w-12 h-12 text-sm text-white bg-gray-300 inline-flex items-center justify-center rounded-full">
            <img
              alt="..."
              className="w-full rounded-full align-middle border-none shadow-lg"
              src="assets/team-1-800x800.jpg"
            />
          </span>
        </div>
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? 'block ' : 'hidden ') +
          'bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1'
        }
        style={{ minWidth: '12rem' }}
      >
        <a
          href="#pablo"
          className={
            'text-sm py-2 px-4 font-normal block w-full whitespace-no-wrap bg-transparent text-gray-800'
          }
          onClick={e => e.preventDefault()}
        >
          Action
        </a>
        <a
          href="#pablo"
          className={
            'text-sm py-2 px-4 font-normal block w-full whitespace-no-wrap bg-transparent text-gray-800'
          }
          onClick={e => e.preventDefault()}
        >
          Another action
        </a>
        <a
          href="#pablo"
          className={
            'text-sm py-2 px-4 font-normal block w-full whitespace-no-wrap bg-transparent text-gray-800'
          }
          onClick={e => e.preventDefault()}
        >
          Something else here
        </a>
        <div className="h-0 my-2 border border-solid border-gray-200" />
        <a
          href="#pablo"
          className={
            'text-sm py-2 px-4 font-normal block w-full whitespace-no-wrap bg-transparent text-gray-800'
          }
          onClick={e => e.preventDefault()}
        >
          Seprated link
        </a>
      </div>
    </>
  );
};
