import { Link } from "react-router-dom";

export default function Logo({ show }) {
  return (
    <Link to={'/'} className={("flex gap-1 md:text-white hover:md:text-white no-underline ") + (show ? 'max-md:text-white hover:max-md:text-white' : 'max-md:text-gray-800 hover:max-md:text-gray-800')}>
<img src="	https://arlo.codelayers.net/arlo/images/2019/06/13/desktop-logo.png" alt="" />
    </Link>
  );
}