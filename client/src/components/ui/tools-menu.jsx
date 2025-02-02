import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';

export function ToolsMenu({ className }) {
  const [serverInfo, setServerInfo] = React.useState(null);

  // Fetch server info on mount
  React.useEffect(() => {
    async function fetchServerInfo() {
      try {
        // First try server info endpoint
        const response = await fetch('http://localhost:5001/api/server-info');
        const info = await response.json();
        setServerInfo(info);
      } catch (error) {
        console.error('Error fetching server info:', error);
        // If REACT_APP_HOST is defined, use it as fallback
        if (process.env.REACT_APP_HOST) {
          setServerInfo({
            ip: process.env.REACT_APP_HOST,
            port: 5001
          });
        } else {
          // Last resort: use URL hostname
          setServerInfo({
            ip: window.location.hostname,
            port: 5001
          });
        }
      }
    }
    fetchServerInfo();
  }, []);

  const handleOpenViewer = () => {
    if (!serverInfo) return;
    window.open(`http://${serverInfo.ip}:3002/viewer`, '_blank');
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4',
            className
          )}
        >
          Tools
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md p-1 shadow-md border border-gray-200 dark:border-gray-700"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
            onSelect={handleOpenViewer}
          >
            Open Viewer
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}