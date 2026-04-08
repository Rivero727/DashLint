import Link from 'next/link';
//import NavLinks from '@/app/ui/dashboard/nav-links';
//import AcmeLogo from '@/app/ui/acme-logo';
//import { PowerIcon } from '@heroicons/react/24/outline';
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
          <span className={Styles.logoText}>CRM Lite</span>
        </div>
      </Link>
      <div className={Styles.navContent}>

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
