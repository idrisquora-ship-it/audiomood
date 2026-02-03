import React from 'react';
import { Music, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthContext } from '@/contexts/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';
import MobileSidebar from './MobileSidebar';

const MobileHeader: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-lg md:hidden">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <Music className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gradient-primary">Senoxa</span>
      </Link>

      <div className="flex items-center gap-2">
        {isAuthenticated && <NotificationBell />}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <MobileSidebar onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default MobileHeader;
