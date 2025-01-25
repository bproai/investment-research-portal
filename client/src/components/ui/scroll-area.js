// client/src/components/ui/scroll-area.js
export function ScrollArea({ className = "", children, ...props }) {
    return (
      <div className={`overflow-auto ${className}`} {...props}>
        {children}
      </div>
    );
  }