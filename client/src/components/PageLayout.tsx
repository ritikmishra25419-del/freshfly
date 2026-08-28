import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import '../styles/sidebar.css';
import '../styles/pagelayout.css';

interface Props {
  children: ReactNode;
}

export default function PageLayout({ children }: Props) {
  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}