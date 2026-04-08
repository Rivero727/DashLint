import Link from 'next/link';
import NavLinks from '@/components/_nav-links/nav-links';
//import AcmeLogo from '@/app/ui/acme-logo';
import Styles from "@/components/ui/sidenav.module.css";

export default function SideNav() {
  return (
    <div className={Styles.container}>
      <Link
        className={Styles.logoLink}
        href="/"
      >
        <div className={Styles.logoContainer}>
          <img src="/next.svg" alt="Logo" />
          <span className={Styles.logoText}>DashLint</span>
        </div>
      </Link>
      <div className={Styles.navContent}>
          <NavLinks />
        <div className={Styles.spacer}></div>
        <form>
          <button className={Styles.signOutButton}>
            <div className={Styles.buttonText}>Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
