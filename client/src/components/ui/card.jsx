// client/src/components/ui/card.jsx
export function Card({ className, ...props }) {
    return (
      <div className={`rounded-lg border bg-card text-card-foreground shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${className}`} {...props} />
    );
  }
  
  export function CardHeader({ className, ...props }) {
    return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />;
  }
  
  export function CardTitle({ className, ...props }) {
    return <h3 className={`text-lg font-semibold leading-none dark:text-gray-100 ${className}`} {...props} />;
  }
  
  export function CardDescription({ className, ...props }) {
    return <p className={`text-sm text-muted-foreground dark:text-gray-400 ${className}`} {...props} />;
  }
  
  export function CardContent({ className, ...props }) {
    return <div className={`p-6 pt-0 ${className}`} {...props} />;
  }
  
  // client/src/components/ui/badge.jsx
  export function Badge({ variant = "default", className, ...props }) {
    const variants = {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-input bg-background"
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`} {...props} />
    );
  }
  
  // client/src/components/ui/scroll-area.jsx
  export function ScrollArea({ className, children, ...props }) {
    return (
      <div className={`overflow-auto ${className}`} {...props}>
        {children}
      </div>
    );
  }