type SubmitButtonProps = Pick<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
  'children' | 'disabled'
>;

export function SubmitButton({ children, ...props }: SubmitButtonProps) {
  return (
    <button
      {...props}
      type="submit"
      className="bg-primary text-white text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none w-full disabled:opacity-50 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}
