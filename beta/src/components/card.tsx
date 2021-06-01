import { FC } from 'react';

export const Card: FC<{ title: string }> = ({ title, children }) => {
  return (
    <div className="w-full px-4">
      <div className="min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="relative w-full px-4">
            <h3 className="font-semibold text-base text-dark">{title}</h3>
          </div>
        </div>
        <div className="rounded-b block w-full overflow-x-auto">{children}</div>
      </div>
    </div>
  );
};
