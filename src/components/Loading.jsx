import Spinner from './Spinner';

export default function Loading({ message = 'Loading page...' }) {
  return <Spinner message={message} />;
}
