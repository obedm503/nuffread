import { ApolloError } from '@apollo/client';
import { Field, useField } from 'formik';
import { GraphQLError } from 'graphql';
import { eye, eyeOff } from 'ionicons/icons';
import { memo, useCallback, useState } from 'react';
import { classes } from '../util';
import { Icon } from './icon';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const Control = memo<{
  name: string;
  label: string;
  disabled: boolean;
  children: (hasError: boolean) => JSX.Element;
}>(({ label, name, children, disabled }) => {
  const [, meta] = useField(name);

  return (
    <div className="relative w-full mb-4">
      <label className="block text-xs font-bold">
        <p
          className={classes('uppercase mb-2', {
            'opacity-50 pointer-events-none': disabled,
          })}
        >
          {label}
        </p>

        {children(!!meta.error)}

        {meta.error ? (
          <div className="text-danger font-normal mt-2 normal-case">
            {meta.error}
          </div>
        ) : null}
      </label>
    </div>
  );
});

export const Text = memo<{ name: string; label: string } & InputProps>(
  ({ name, label, ...props }) => {
    return (
      <Control name={name} label={label} disabled={!!props.disabled}>
        {hasError => (
          <Field
            name={name}
            type="text"
            placeholder={label}
            {...props}
            className={classes(
              'h-10 px-3 py-3 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full border border-light disabled:opacity-50 disabled:pointer-events-none',
              { 'border-red focus:border-red': hasError },
            )}
          />
        )}
      </Control>
    );
  },
);

export const Email = memo<{ name: string; label: string } & InputProps>(
  props => {
    return <Text {...props} type="email" autoComplete="username" />;
  },
);

export const Passphase = memo<{ name: string; label: string } & InputProps>(
  ({ name, label, ...props }) => {
    const [isVisible, setVisible] = useState(false);
    const toggle = useCallback(() => setVisible(visibility => !visibility), [
      setVisible,
    ]);

    const type = isVisible ? 'text' : 'password';
    const icon = isVisible ? eye : eyeOff;

    return (
      <Control name={name} label={label} disabled={!!props.disabled}>
        {hasError => (
          <div className="relative">
            <Field
              {...props}
              name={name}
              type={type}
              placeholder={label}
              autoComplete="current-password"
              className={classes(
                'h-10 pl-3 pr-12 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full border border-light disabled:opacity-50 disabled:pointer-events-none',
                { 'border-red focus:border-red': hasError },
              )}
            />
            <button
              type="button"
              className="absolute w-4 top-0 right-0 mr-4 mt-3 outline-none disabled:opacity-50 disabled:pointer-events-none text-medium"
              onClick={toggle}
              disabled={props.disabled}
            >
              <Icon icon={icon} />
            </button>
          </div>
        )}
      </Control>
    );
  },
);

export const apolloFormErrors = (handlers: {
  [message: string]:
    | React.ReactNode
    | React.FunctionComponent<{ error: GraphQLError }>;
}) =>
  memo<{ error?: ApolloError }>(function ApolloFormErrors({ error }) {
    const errors = error?.graphQLErrors;
    if (!errors) {
      return null;
    }
    return (
      <>
        {errors.map(e => {
          const Render = handlers[e.message];
          if (!Render) {
            // unhandled error
            throw error;
          }
          return (
            <div key={e.message} className="w-full mb-4 text-danger">
              {typeof Render === 'function' ? <Render error={e} /> : Render}
            </div>
          );
        })}
      </>
    );
  });
