// client/src/components/ui/badge.js
export function Badge({ variant = "default", className = "", ...props }) {
    const variants = {
      default: "bg-blue-500 text-white",
      secondary: "bg-gray-500 text-white",
      outline: "border border-gray-300 bg-white text-gray-700"
    };
    return (
      <span 
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`} 
        {...props} 
      />
    );
  }
  
  // client/src/components/ui/card.js
  export function Card({ className = "", ...props }) {
    return (
      <div 
        className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`} 
        {...props} 
      />
    );
  }
  
  export function CardHeader({ className = "", ...props }) {
    return <div className={`flex flex-col space-y-1.5 p-4 ${className}`} {...props} />;
  }
  
  export function CardTitle({ className = "", ...props }) {
    return <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props} />;
  }
  
  export function CardDescription({ className = "", ...props }) {
    return <p className={`text-sm text-gray-500 ${className}`} {...props} />;
  }
  
  export function CardContent({ className = "", ...props }) {
    return <div className={`p-4 pt-0 ${className}`} {...props} />;
  }